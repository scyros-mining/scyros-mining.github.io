# scyros-website

The website for [Scyros](https://github.com/fxpl/scyros).

Three pages, no build tooling, no dependencies, no network requests at runtime:

| Page | What it covers |
|---|---|
| `index.html` | Scyros: what it is, how to install it, the papers that use it, and how to cite it |
| `tutorial.html` | A complete small study, step by step, for someone who has never used Scyros |
| `docs.html` | Installation, GitHub tokens, the keyword-file format, running steps again, and a reference for the eleven subcommands |

Each paper in the Research section of the home page is a card with a short
summary and links to the paper, its dataset and its benchmarks. The links point
to the archives rather than repeating them. Their READMEs document contents,
columns and licences:

- OOPSLA 2026 dataset: <https://doi.org/10.5281/zenodo.17055622>
- OOPSLA 2026 benchmarks: <https://doi.org/10.5281/zenodo.22712519>
- TACAS 2026 benchmarks: <https://github.com/fxpl/stainless-float-benchmarks>

The Zenodo links are concept DOIs, so they always resolve to the newest version.

Until October 2026 the site also had a page on the OOPSLA study, with charts
of its statistics. It is in the git history (commit `7064dad`) if it is ever
needed again.

## Running it

Nothing to install. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Editing

**Content** lives in the three HTML files and is edited directly.

**The header and footer** are shared. They live in `partials/`, and each page
carries marker comments showing where they are expanded:

```html
<!-- #include header current="docs" -->
  ...generated, do not hand-edit...
<!-- /include -->
```

Inside a partial, `{{aria:docs}}` expands to `aria-current="page"` when that
page is the current one. After editing anything in `partials/`, run:

```bash
python3 build.py
```

It rewrites only the marked regions, in place, and running it twice changes
nothing the second time. `python3 build.py --check` exits non-zero if a page is
out of date, which is what you would run in CI.

**Adding a paper.** Copy one of the cards in the Research section of
`index.html`. Give it an `id`, the venue, title and authors, a one-paragraph
summary, and buttons for the paper (by DOI) and for whichever of its dataset
and benchmarks exist.

**The citation** on the home page is the OOPSLA study, the paper Scyros was
introduced in. When the tool paper is published, replace it.

## Deploying

The site is plain HTML with relative paths throughout, so it works unchanged at
a domain root, at a subpath such as `fxpl.github.io/scyros-website/`, or copied
into a Jekyll site as a folder (Jekyll copies files without front matter as they
are). Keep the `.html` extension in links, since extensionless routing is the one
thing that differs between hosts.

## Layout

```
index.html  tutorial.html  docs.html
partials/            header.html, footer.html
build.py             expands the partials, in place
assets/
  css/site.css       colour tokens and every style
  js/site.js         theme toggle, install tabs and copy buttons
  logo/neutral.svg   the logo, cleaned and cropped
  favicon.svg        the same logo on a square canvas
  apple-touch-icon.png
  fonts/             Geist and Geist Mono, self-hosted (OFL, licences included)
```

## Notes for whoever maintains this

**The logo files.** The original Illustrator exports contained four hidden
raster images left over from tracing, which made them 10 MB each. The visible
logo is seven vector shapes. `assets/logo/neutral.svg` keeps only those
shapes, with the viewBox cropped to the drawing (`240 305 1120 828`), which
brings it to 3 KB. `assets/favicon.svg` is the same with a square viewBox
(`240 159 1120 1120`). If the logo changes, redo both the same way.

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

**Without JavaScript** the install tabs show every option with a label, and
the copy buttons and theme button stay hidden.

**Papers are linked by DOI only**, not to a PDF, to stay within the
publishers' terms.

**Register.** Plain, descriptive copy. British English throughout, with
"program" rather than "programme" for software.

## The tutorial and the docs

Both pages follow **Scyros 0.4.0**. They replace the interactive Streamlit
tutorial that used to live in `fxpl/scyros-tutorial`.

**The tutorial** (concurrency in Java and Go) is meant to be run as written.
Its keyword file, the `download`, `duplicate_files` and `parse` steps, and the
matching rules were checked by running 0.4.0 on a small local project. The
steps that call GitHub were not run for the site. The example rows of
`ids.csv`, `metadata.csv` and `languages.csv` are invented, in the real
formats, and the numbers in the `functions.csv` rows come from the local run.

The tutorial's sample size (2,000 repositories) and its "check" notes come
from the OOPSLA artifact's intermediate files: about a third of sampled
repositories are forks, about 10% of the others pass
`filter_metadata -s 50 -a 60 --non-code`, and about 13% of those contain
Java or Go (Java 11.7%, Go 1.7%). That leaves around 15 repositories for about
1,500 API requests. If the example changes, redo this estimate.

**The reference** in `docs.html` gives, for each subcommand, what it reads,
the columns it writes, and its main options only. `scyros <subcommand> --help`
stays the complete list, so the site does not have to repeat every flag. At
each release, compare the tables with `--help` and with `src/docs/*.md` in
Scyros, and update the version above.

## Mismatches found in the sources

Left as they are, but worth fixing at the source:

- **Counts.** The site uses the paper's counts throughout. The Zenodo archives
  differ slightly: the dataset's README gives 9,945,628 functions where the
  paper gives 9,945,253, and the benchmark archive holds 58 benchmarks where the
  paper describes 59 (one was removed because its licence could not be
  established). The OOPSLA card on the home page gives no benchmark count for
  that reason.
- **The artifact's function file.** `data/datasets/fp_functions_old.csv` in the
  local artifact has 9,945,474 floating-point functions (293,343 in Go), where
  the paper gives 9,945,253 (293,122 in Go). The other five languages match.
  Its `fpbench.csv` has 130 rows; the paper says FPBench has 131 functions.
  Neither difference changes a median or IQR in Table 4.
- **`pr`, not `pull_request`.** The pull-request subcommand is invoked as
  `scyros pr`, although its source and docs files are named `pull_request`.
- **`parse -l`.** Its help says it is a folder, but it is the path of the log
  file.
- **`extract_benchmarks`** was removed in 0.4.0, but
  `src/docs/extract_benchmarks.md` is still there.
- **`download --skip`.** In this mode the file log has no `id` column and calls
  the path column `path` instead of `name`, so it cannot go straight into
  `parse`.
- **`filter_languages` help** shows only the plain list of languages, but the
  command also reads full keyword files, which is what the site uses.
- **Three BibTeX entries.** The Scyros README (ACM export), the Zenodo READMEs
  (key `gilot2026floatingpoint`) and this site each give a slightly different
  entry. This site keeps the Scyros README's key and adds `{GitHub}` so that
  BibTeX styles do not lowercase it.

## Licence

Site code Apache-2.0, matching Scyros. Geist and Geist Mono are SIL OFL 1.1;
their licences are in `assets/fonts/`.
