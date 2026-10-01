/* Draws the study's charts from study-data.js. A figure names its data set
   and the values to plot:

     <figure class="chart" data-chart="bars" data-source="structure"
             data-series="loops" data-tick="loops-all" data-emphasis="FPBench"
             data-unit="%" data-max="100">

   data-emphasis draws one row in the second colour below a divider;
   data-separate only adds the divider, for a total row.

   Chart types:
     bars      one or two series; a single series can carry a comparison
               tick (data-tick)
     range     data-series="q1,median,q3", a dot in a quartile band;
               data-compare="q1,median,q3" adds a comparison under it, and
               data-whole-numbers keeps the axis steps whole
     mean-sd   data-series="mean,sd", a dot with a one-deviation whisker
     log-dots  one or two series on a logarithmic axis between data-min
               and data-max

   Labels and values are real text, so screen readers can read each chart.
   Values shown only by position, such as ticks and dots, carry a visually
   hidden label. */

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function hidden(text) {
  return element('span', 'visually-hidden', text);
}

function format(value) {
  return value.toLocaleString('en-GB', { maximumFractionDigits: 4 });
}

function listOf(attribute) {
  return attribute ? attribute.split(',').map((item) => item.trim()) : [];
}

/* Tries four to six intervals and keeps whichever ends closest above max.
   Counts of whole things (loops, calls) never get a fractional step. */
function niceTicks(max, wholeNumbers = false) {
  const options = [4, 5, 6].map((target) => {
    const raw = max / target;
    const power = 10 ** Math.floor(Math.log10(raw));
    const nice = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw);
    const step = wholeNumbers ? Math.max(1, Math.round(nice)) : nice;
    return { step, top: Math.ceil(max / step - 1e-9) * step };
  });
  const { step, top } = options.reduce((best, option) => (option.top < best.top ? option : best));
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toPrecision(12));
}

function compact(value) {
  if (value >= 1e6) return `${+(value / 1e6).toPrecision(3)}M`;
  if (value >= 1e4) return `${+(value / 1e3).toPrecision(3)}k`;
  return format(value);
}

function linearScale(ticks) {
  const top = ticks[ticks.length - 1];
  return { ticks, position: (value) => (value / top) * 100, label: compact };
}

function logScale(min, max) {
  const low = Math.log10(min);
  const span = Math.log10(max) - low;
  const ticks = [];
  for (let power = low; power <= Math.log10(max) + 1e-9; power += 1) ticks.push(10 ** power);
  return {
    ticks,
    position: (value) => ((Math.log10(value) - low) / span) * 100,
    label: (value) => String(+value.toPrecision(1)),
  };
}

function setLeft(node, percent) {
  node.style.left = `${percent}%`;
  return node;
}

/* One tooltip per figure, filled with textContent only. */
function attachTooltip(figure, row, title, lines) {
  let tip = figure.querySelector('.tooltip');
  if (!tip) {
    tip = element('div', 'tooltip');
    tip.setAttribute('aria-hidden', 'true');
    tip.hidden = true;
    figure.append(tip);
  }
  row.addEventListener('pointerenter', () => {
    tip.replaceChildren(element('p', 'tooltip__title', title));
    for (const line of lines) {
      const entry = element('p', 'tooltip__line');
      entry.append(element('span', `tooltip__key ${line.keyClass || ''}`), element('strong', null, line.value), element('span', null, line.name));
      tip.append(entry);
    }
    tip.hidden = false;
  });
  row.addEventListener('pointermove', (event) => {
    const box = figure.getBoundingClientRect();
    const x = Math.min(event.clientX - box.left + 14, box.width - tip.offsetWidth);
    tip.style.left = `${Math.max(0, x)}px`;
    tip.style.top = `${event.clientY - box.top + 16}px`;
  });
  row.addEventListener('pointerleave', () => { tip.hidden = true; });
}

function plotRow(label, scale, separated) {
  const row = element('div', separated ? 'plot__row plot__row--separated' : 'plot__row');
  const track = element('span', 'plot__track');
  scale.ticks.forEach((tick, i) => track.append(setLeft(element('span', i === 0 ? 'plot__gridline plot__gridline--zero' : 'plot__gridline'), scale.position(tick))));
  const name = element('span', 'plot__label', label);
  name.append(hidden(': '));
  row.append(name, track);
  return { row, track };
}

function axisRow(scale, unit) {
  const row = element('div', 'plot__axis');
  row.setAttribute('aria-hidden', 'true');
  const track = element('span', 'plot__track');
  scale.ticks.forEach((tick) => track.append(setLeft(element('span', null, scale.label(tick) + unit), scale.position(tick))));
  row.append(element('span'), track);
  return row;
}

function newPlot(figure, longestValue) {
  const plot = element('div', 'plot');
  plot.style.setProperty('--value-space', `${Math.max(2.2, longestValue * 0.58 + 0.9)}em`);
  figure.querySelector('.chart__plot').replaceWith(plot);
  return plot;
}

/* The bars drawn in each row: one series, or two side by side. The first
   (or only) series can carry a comparison tick. */
function barSpecs(figure) {
  const series = listOf(figure.dataset.series);
  if (series.length === 2) {
    return series.map((key, i) => ({ key, slot: i === 0 ? '--pair-a' : '--pair-b', second: i === 1, named: true }));
  }
  return [{ key: series[0], tick: figure.dataset.tick, slot: '' }];
}

function renderBars(figure, data) {
  const specs = barSpecs(figure);
  const unit = figure.dataset.unit || '';
  const measured = data.rows.flatMap((row) => specs.flatMap((spec) => [row[spec.key], row[spec.tick]]).map((value) => value ?? 0));
  const scale = linearScale(niceTicks(Number(figure.dataset.max) || Math.max(...measured)));
  const labelOf = (spec, value) => format(value) + unit;
  const longest = Math.max(...data.rows.flatMap((row) => specs.map((spec) => labelOf(spec, row[spec.key] ?? 0).length)));
  const plot = newPlot(figure, specs.length === 2 ? longest * 0.9 : longest);

  for (const entry of data.rows) {
    const emphasised = entry.label === figure.dataset.emphasis;
    const { row, track } = plotRow(entry.label, scale, emphasised || entry.label === figure.dataset.separate);
    const lines = [];

    specs.forEach((spec, i) => {
      const value = entry[spec.key];
      if (value === null || value === undefined) return;
      const comparison = spec.tick ? entry[spec.tick] ?? null : null;
      const tickAt = comparison === null ? 0 : scale.position(comparison);
      const text = labelOf(spec, value);
      const second = spec.second || emphasised;
      const classes = ['plot__bar', second && 'plot__bar--s2', spec.slot && `plot__bar${spec.slot}`];
      const bar = element('span', classes.filter(Boolean).join(' '));
      bar.style.width = `${scale.position(value)}%`;
      const label = setLeft(element('span', `plot__value${spec.slot && ` plot__value${spec.slot}`}`, text), Math.max(scale.position(value), tickAt));
      const name = emphasised ? entry.label : data.names[spec.key];
      if (spec.named) label.prepend(hidden(`${i === 0 ? '' : ', '}${name}: `));
      track.append(bar, label);
      lines.push({ value: text, name, keyClass: second ? 'tooltip__key--s2' : '' });

      if (comparison !== null) {
        const tickText = format(comparison) + unit;
        track.append(setLeft(element('span', `plot__tick${spec.slot && ` plot__tick${spec.slot}`}`), tickAt), hidden(`, ${data.names[spec.tick]}: ${tickText}`));
        lines.push({ value: tickText, name: data.names[spec.tick], keyClass: 'tooltip__key--tick' });
      }
    });

    attachTooltip(figure, row, entry.label, lines);
    plot.append(row);
  }
  plot.append(axisRow(scale, unit));
}

/* A mean with a whisker of one standard deviation on either side. The label
   shows the mean; the deviation is in the tooltip and for screen readers. */
function renderMeanSd(figure, data) {
  const [meanKey, sdKey] = listOf(figure.dataset.series);
  const unit = figure.dataset.unit || '';
  const top = Number(figure.dataset.max) || Math.max(...data.rows.map((row) => row[meanKey] + row[sdKey]));
  const scale = linearScale(niceTicks(top));
  const labelOf = (row) => `${format(row[meanKey])}${unit}`;
  const plot = newPlot(figure, Math.max(...data.rows.map((row) => labelOf(row).length)));

  for (const entry of data.rows) {
    const { row, track } = plotRow(entry.label, scale, false);
    const low = Math.max(0, entry[meanKey] - entry[sdKey]);
    const high = Math.min(top, entry[meanKey] + entry[sdKey]);
    const whisker = setLeft(element('span', 'plot__whisker'), scale.position(low));
    whisker.style.width = `${scale.position(high) - scale.position(low)}%`;
    const label = setLeft(element('span', 'plot__value', labelOf(entry)), scale.position(high));
    label.prepend(hidden(`${data.names[meanKey]} `));
    label.append(hidden(`, ${data.names[sdKey]} ${format(entry[sdKey])}${unit}`));
    track.append(whisker, setLeft(element('span', 'plot__dot'), scale.position(entry[meanKey])), label);
    attachTooltip(figure, row, entry.label, [
      { value: format(entry[meanKey]) + unit, name: data.names[meanKey] },
      { value: `± ${format(entry[sdKey])}${unit}`, name: data.names[sdKey], keyClass: 'tooltip__key--spread' },
    ]);
    plot.append(row);
  }
  plot.append(axisRow(scale, unit));
}

/* A median as a dot inside a band from the first to the third quartile. With
   data-compare, a second median and quartiles (keys q1,median,q3) sit under
   it as a thin line with a tick. */
function renderRange(figure, data) {
  const [low, middle, high] = listOf(figure.dataset.series);
  const [compareLow, compareMiddle, compareHigh] = listOf(figure.dataset.compare);
  const unit = figure.dataset.unit || '';
  const tops = data.rows.flatMap((row) => [row[high], compareHigh ? row[compareHigh] ?? 0 : 0]);
  const scale = linearScale(niceTicks(Number(figure.dataset.max) || Math.max(...tops), 'wholeNumbers' in figure.dataset));
  const plot = newPlot(figure, Math.max(...data.rows.map((row) => (format(row[middle]) + unit).length)));
  const span = (key, row) => `${format(row[key])}${unit}`;

  for (const entry of data.rows) {
    const emphasised = entry.label === figure.dataset.emphasis;
    const { row, track } = plotRow(entry.label, scale, emphasised || entry.label === figure.dataset.separate);
    const compared = compareMiddle && entry[compareMiddle] !== null && entry[compareMiddle] !== undefined;
    const slot = compared ? ' plot__range--pair-a' : '';
    const colour = emphasised ? ' plot__range--s2' : '';

    const band = setLeft(element('span', `plot__band${slot}${colour}`), scale.position(entry[low]));
    band.style.width = `${scale.position(entry[high]) - scale.position(entry[low])}%`;
    const dot = setLeft(element('span', `plot__dot${slot}${emphasised ? ' plot__dot--s2' : ''}`), scale.position(entry[middle]));
    const rightmost = Math.max(entry[high], compared ? entry[compareHigh] : 0);
    const label = setLeft(element('span', `plot__value plot__value--range${compared ? ' plot__value--upper' : ''}`, span(middle, entry)), scale.position(rightmost));
    label.append(hidden(` ${emphasised ? 'median' : data.names[middle]}; first to third quartile: ${span(low, entry)} to ${span(high, entry)}`));
    track.append(band, dot, label);

    const name = emphasised ? 'median' : data.names[middle];
    const lines = [
      { value: span(middle, entry), name, keyClass: emphasised ? 'tooltip__key--s2' : '' },
      { value: `${span(low, entry)} to ${span(high, entry)}`, name: 'first to third quartile', keyClass: `tooltip__key--spread${emphasised ? ' tooltip__key--s2' : ''}` },
    ];

    if (compared) {
      const line = setLeft(element('span', 'plot__compare'), scale.position(entry[compareLow]));
      line.style.width = `${scale.position(entry[compareHigh]) - scale.position(entry[compareLow])}%`;
      track.append(line, setLeft(element('span', 'plot__tick plot__tick--compare'), scale.position(entry[compareMiddle])),
        hidden(`, ${data.names[compareMiddle]}: ${span(compareMiddle, entry)}, first to third quartile: ${span(compareLow, entry)} to ${span(compareHigh, entry)}`));
      lines.push(
        { value: span(compareMiddle, entry), name: data.names[compareMiddle], keyClass: 'tooltip__key--tick' },
        { value: `${span(compareLow, entry)} to ${span(compareHigh, entry)}`, name: 'first to third quartile, all functions', keyClass: 'tooltip__key--tick' },
      );
    }

    attachTooltip(figure, row, entry.label, lines);
    plot.append(row);
  }
  plot.append(axisRow(scale, unit));
}

function renderLogDots(figure, data) {
  const series = listOf(figure.dataset.series);
  const unit = figure.dataset.unit || '';
  const scale = logScale(Number(figure.dataset.min), Number(figure.dataset.max));
  const plot = newPlot(figure, 0);
  plot.style.setProperty('--value-space', '1rem');

  for (const entry of data.rows) {
    const { row, track } = plotRow(entry.label, scale, false);
    const lines = [];
    series.forEach((key, i) => {
      const value = entry[key];
      if (value === null) return;
      const text = format(value) + unit;
      track.append(setLeft(element('span', i === 1 ? 'plot__dot plot__dot--s2' : 'plot__dot'), scale.position(value)), hidden(`${i === 0 ? '' : ', '}${data.names[key]}: ${text}`));
      lines.push({ value: text, name: data.names[key], keyClass: i === 1 ? 'tooltip__key--s2' : '' });
    });
    attachTooltip(figure, row, entry.label, lines);
    plot.append(row);
  }
  plot.append(axisRow(scale, unit));
}

const RENDERERS = { bars: renderBars, range: renderRange, 'log-dots': renderLogDots, 'mean-sd': renderMeanSd };

document.addEventListener('DOMContentLoaded', () => {
  for (const figure of document.querySelectorAll('figure[data-chart]')) {
    RENDERERS[figure.dataset.chart](figure, window.STUDY_DATA[figure.dataset.source]);
  }
});
