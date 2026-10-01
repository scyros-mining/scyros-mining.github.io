# scyros-website

The website for [Scyros](https://github.com/fxpl/scyros) and the OOPSLA 2026
study it was built for.

Three pages, no build tooling, no dependencies, no network requests at runtime:

| Page | What it covers |
|---|---|
| `index.html` | Scyros: what it is, how to install it, the research that uses it, and how to cite it |
| `docs.html` | Installation in full, GitHub tokens, and the eleven subcommands |
| `study.html` | The floating-point study: how the data was mined, the dataset and benchmarks on Zenodo, charts of its statistics on floating-point code, two example benchmarks, and the artifact for reproducing the results |

The study page shows the statistics as charts only; the paper has the tables.
It links to the Zenodo archives rather than repeating them. Their READMEs
document contents, columns and licences:

- Dataset: <https://doi.org/10.5281/zenodo.17055622>
- Benchmarks: <https://doi.org/10.5281/zenodo.22712519>
- OOPSLA artifact: <https://doi.org/10.5281/zenodo.18500268>

These are concept DOIs, so they always resolve to the newest version.

## Running it

Nothing to install. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Editing

**Content** lives in the three HTML files and is edited directly.

**The study's numbers** all live in `assets/js/study-data.js`, one set per
table of the paper, with the table each came from noted in a comment.
`assets/js/charts.js` draws every chart from it when the page loads, so
correcting a number there corrects its chart. A figure names its data set and
the values to plot:

```html
<figure class="chart" data-chart="bars" data-source="structure"
        data-series="loops" data-tick="loops-all" data-emphasis="FPBench"
        data-unit="%" data-max="100">
```

The chart types are `bars`, `range` (median with first and third quartiles),
`mean-sd` (mean with one standard deviation either side) and `log-dots`. The
comment at the top of `charts.js` lists every attribute.

**Spreads.** Wherever the paper reports a spread, the chart shows it: medians
with their first and third quartiles as a dot in a band (Tables 2 and 4), and
means with one standard deviation as whiskers (Table 3; the deviation itself
is shown on hover). The paper prints Table 4 as medians and IQRs only, so the
quartiles in `study-data.js` were computed from the OOPSLA artifact's data
(`fp_functions_old.csv`, `non_numerical_functions.csv` and `fpbench.csv`)
with the artifact's own method, `quartiles_row` in `artifact/helpers.py`. They
reproduce all 130 medians and IQRs of Table 4 exactly.

**The header and footer** are shared. They live in `partials/`, and each page
carries marker comments showing where they are expanded:

```html
<!-- #include header current="study" -->
  ...generated, do not hand-edit...
<!-- /include -->
```

Inside a partial, `{{aria:study}}` expands to `aria-current="page"` when that
page is the current one. After editing anything in `partials/`, run:

```bash
python3 build.py
```

It rewrites only the marked regions, in place, and running it twice changes
nothing the second time. `python3 build.py --check` exits non-zero if a page is
out of date, which is what you would run in CI.

**Adding a study.** Add a card to the Research section of `index.html` and a
page for it, and link that page from the header in `partials/header.html`.

**The citation** appears twice on purpose: on the home page as the way to cite
Scyros, and on the study page as the way to cite the study. They are the same
entry today. When the tool paper is published, replace the one in `index.html`.

## Deploying

The site is plain HTML with relative paths throughout, so it works unchanged at
a domain root, at a subpath such as `fxpl.github.io/scyros-website/`, or copied
into a Jekyll site as a folder (Jekyll copies files without front matter as they
are). Keep the `.html` extension in links, since extensionless routing is the one
thing that differs between hosts.

`assets/pictures/pipeline.pdf` is the source of the pipeline figure. The site
shows `pipeline.png` and never links to the PDF, so it can be left out of the
deployed copy.

## Layout

```
index.html  docs.html  study.html
partials/            header.html, footer.html
build.py             expands the partials, in place
assets/
  css/site.css       colour tokens and every style
  js/site.js         theme toggle, install tabs and copy buttons
  js/study-data.js   every figure plotted on the study page
  js/charts.js       draws the study's charts from study-data.js
  js/highlight.js    colours and numbers the C listings on the study page
  logo/neutral.svg   the logo, cleaned and cropped
  favicon.svg        the same logo on a square canvas
  apple-touch-icon.png
  fonts/             Geist and Geist Mono, self-hosted (OFL, licences included)
  pictures/          the pipeline figure: pipeline.pdf (source) and pipeline.png
```

## Notes for whoever maintains this

**The logo files.** The original Illustrator exports contained four hidden
raster images left over from tracing, which made them 10 MB each. The visible
logo is seven vector shapes. `assets/logo/neutral.svg` keeps only those
shapes, with the viewBox cropped to the drawing (`240 305 1120 828`), which
brings it to 3 KB. `assets/favicon.svg` is the same with a square viewBox
(`240 159 1120 1120`). If the logo changes, redo both the same way.

**The pipeline figure** is rendered from the PDF with Ghostscript, at 168 dpi
so it stays sharp on high-density screens at full width:

```bash
gs -q -dSAFER -dBATCH -dNOPAUSE -sDEVICE=png16m -r168 \
   -dTextAlphaBits=4 -dGraphicsAlphaBits=4 \
   -o assets/pictures/pipeline.png assets/pictures/pipeline.pdf
```

The slide has a white background, so the figure sits on a white card in both
themes, slightly dimmed in dark mode. Its `alt` text in `study.html` lists the
nine steps; update it if the figure changes.

**Neutral, not outline, for small sizes.** The filled ("neutral") logo stays
readable at 16 px. The outline ("white") variant almost disappears at that size,
because its strokes are thinner than a pixel.

**Colours.** The brand blue `#0d84bb` comes from the logo. It reaches only about
4.2:1 contrast on white, so text links and the primary button use a darker
`#0b6c9a` (about 5.8:1). Every colour is written once as `light-dark(light, dark)`
in `site.css`, which needs a browser from 2024 or later.

**Theme.** The site follows the visitor's system setting until they press the
sun/moon button in the header. The choice is then stored in `localStorage` and
applies on every page. `site.js` loads in `<head>` so the stored theme is set
before the first paint, without a flash of the wrong theme.

**Chart colours** are Okabe and Ito's blue (`#0072b2`) and vermillion
(`#d55e00`), the exact published values, the same in both themes. The pair
passes a colour-vision-deficiency validator against both page backgrounds.
Okabe and Ito's orange (`#e69f00`) was not used for the second series: it is
too light for the dark-mode lightness band and below 3:1 contrast on white.
Spreads are tints of the same hue. Blue is always the first series and
vermillion the second, and every chart with two series has a legend, so no
chart relies on colour alone. Charts are HTML and
CSS, with positions in percentages, so they resize without JavaScript
measuring anything. Their labels and values are real text, and values shown
only by position carry visually hidden labels, so a screen reader reads a row
as, for example, "C: 57%, all functions: 66%".

**Without JavaScript** the install tabs show every option with a label, and
the copy buttons and theme button stay hidden. The study page's charts need
JavaScript; without it the page says so and points to the paper.

**The paper is linked by DOI only**, not to a PDF, to stay within the
publisher's terms.

**Register.** Plain, descriptive copy. British English throughout, with
"program" rather than "programme" for software.

## Mismatches found in the sources

Left as they are, but worth fixing at the source:

- **Counts.** The site uses the paper's counts throughout. The Zenodo archives
  differ slightly: the dataset's README gives 9,945,628 functions where the
  paper gives 9,945,253, and the benchmark archive holds 58 benchmarks where the
  paper describes 59 (one was removed because its licence could not be
  established). The download entries on the study page give no benchmark
  count for that reason.
- **Rust version.** The Scyros README asks for Rust 1.94 when building from
  source, while `Cargo.toml` sets `rust-version = "1.93"` and the badge says
  1.93. The site says 1.93.
- **`parse --lang`.** Scyros's `src/docs/parse.md` says a subset of languages
  can be selected with `--lang`, but `parse` defines no such flag.
- **The artifact's function file.** `data/datasets/fp_functions_old.csv` in the
  local artifact has 9,945,474 floating-point functions (293,343 in Go), where
  the paper gives 9,945,253 (293,122 in Go). The other five languages match.
  Its `fpbench.csv` has 130 rows; the paper says FPBench has 131 functions.
  Neither difference changes a median or IQR in Table 4.
- **`pr`, not `pull_request`.** The pull-request subcommand is invoked as
  `scyros pr`, although its source and docs files are named `pull_request`.
- **`extract_benchmarks`** has a documentation page but is commented out in
  `src/bin/main.rs`, so it is not in the released binary. The site calls it
  experimental.
- **Three BibTeX entries.** The Scyros README (ACM export), the Zenodo READMEs
  (key `gilot2026floatingpoint`) and this site each give a slightly different
  entry. This site keeps the Scyros README's key and adds `{GitHub}` so that
  BibTeX styles do not lowercase it.

## Licence

Site code Apache-2.0, matching Scyros. Geist and Geist Mono are SIL OFL 1.1;
their licences are in `assets/fonts/`.
