/* Theme, tabs and copy buttons. All three are enhancements: without
   JavaScript the page follows the system theme, every tab panel is shown with
   its own label, and copy buttons stay hidden.

   This file loads in <head>, so the stored theme applies before first paint. */

document.documentElement.classList.add('js');

const THEME_KEY = 'scyros-theme';
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function storedTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}

function storeTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* private mode: the choice lasts for this page only */ }
}

function currentTheme() {
  return document.documentElement.dataset.theme || (systemDark.matches ? 'dark' : 'light');
}

const initialTheme = storedTheme();
if (initialTheme === 'light' || initialTheme === 'dark') document.documentElement.dataset.theme = initialTheme;

function initThemeToggle(button) {
  function show() {
    const theme = currentTheme();
    button.dataset.current = theme;
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    storeTheme(next);
    show();
  });
  systemDark.addEventListener('change', show);
  show();
}

function initTabs(tabs) {
  const buttons = [...tabs.querySelectorAll('[role="tab"]')];
  const panels = buttons.map((button) => document.getElementById(button.getAttribute('aria-controls')));

  function select(index) {
    buttons.forEach((button, i) => {
      const selected = i === index;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
  }

  buttons.forEach((button, i) => button.addEventListener('click', () => select(i)));

  tabs.querySelector('[role="tablist"]').addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    const current = buttons.indexOf(document.activeElement);
    const next = (current + step + buttons.length) % buttons.length;
    select(next);
    buttons[next].focus();
  });

  select(0);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const scratch = document.createElement('textarea');
    scratch.value = text;
    scratch.style.position = 'fixed';
    scratch.style.opacity = '0';
    document.body.append(scratch);
    scratch.select();
    document.execCommand('copy');
    scratch.remove();
  }
}

function initCopyButton(button) {
  const label = button.textContent;
  button.addEventListener('click', async () => {
    const source = button.parentElement.querySelector('pre');
    await copyText(source.textContent.trim());
    button.textContent = 'Copied';
    setTimeout(() => { button.textContent = label; }, 1600);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.theme-toggle').forEach(initThemeToggle);
  document.querySelectorAll('[data-tabs]').forEach(initTabs);
  document.querySelectorAll('.copy-btn').forEach(initCopyButton);
});
