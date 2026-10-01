/* Every figure plotted on the study page, as published in the paper:
   Gilot, Wrigstad and Darulova, "Floating-Point Usage on GitHub: A Large-Scale
   Study of Statically Typed Languages", PACMPL 10 (OOPSLA1), article 95, 2026.
   https://doi.org/10.1145/3798203

   Each chart on study.html names one of these sets with data-source and the
   values it plots with data-series. Correct a number here and its chart
   follows. `names` is the wording used for a value in tooltips and for screen
   readers. null means the paper gives no figure. */

window.STUDY_DATA = {
  /* Table 2. Category names follow the paper. `projects` is the share of the 447,209 projects containing the
     category. q1, median and q3 are quartiles, across those projects, of the
     share of their files that contain it. */
  prevalence: {
    names: { projects: 'of projects', median: 'of files in the median project', q1: 'first quartile', q3: 'third quartile' },
    rows: [
      { label: 'Floating-point types', projects: 64, q1: 7.1, median: 17, q3: 35 },
      { label: 'Transcendental functions', projects: 20, q1: 1.3, median: 3.5, q3: 9.5 },
      { label: 'Miscellaneous keywords', projects: 21, q1: 1.4, median: 3.1, q3: 7.1 },
      { label: 'Arbitrary precision', projects: 1.1, q1: 0.13, median: 1.4, q3: 3.6 },
      { label: 'Any of the above', projects: 66, q1: 7.5, median: 18, q3: 36 },
    ],
  },

  /* Table 3. `functions` is the number of floating-point functions extracted;
     9,945,253 in all. `perFile` is the mean share of a file's functions that
     contain floating-point keywords, among files with at least one, and
     `perFileSd` its standard deviation. */
  languages: {
    names: { functions: 'functions', perFile: 'mean', perFileSd: 'standard deviation' },
    rows: [
      { label: 'C++', functions: 4176635, perFile: 41, perFileSd: 33 },
      { label: 'Java', functions: 2574341, perFile: 43, perFileSd: 34 },
      { label: 'C', functions: 1168217, perFile: 53, perFileSd: 40 },
      { label: 'C#', functions: 1009329, perFile: 41, perFileSd: 32 },
      { label: 'TypeScript', functions: 723609, perFile: 48, perFileSd: 33 },
      { label: 'Go', functions: 293122, perFile: 31, perFileSd: 31 },
    ],
  },

  /* Tables 4a and 4b. For each measure: the median, and the first (q1) and
     third (q3) quartiles. Words and parameters count every function; loops,
     conditionals and calls count only functions with at least one, and
     loops, conds and calls on their own are the share of functions with at
     least one. transc is the share mentioning a transcendental function.
     The "-all" keys come from 9,708,183 functions in 10,000 uniformly sampled
     projects; FPBench has no such counterpart.
     The paper prints only the median and the IQR (q3 - q1). The quartiles
     here were computed from the OOPSLA artifact's data with its own method
     (artifact/helpers.py, quartiles_row), and reproduce every median and IQR
     in Table 4. */
  structure: {
    names: {
      words: 'median, floating-point functions', 'words-all': 'median, all functions',
      params: 'median, floating-point functions', 'params-all': 'median, all functions',
      transc: 'floating-point functions',
      loops: 'floating-point functions', 'loops-all': 'all functions',
      conds: 'floating-point functions', 'conds-all': 'all functions',
      calls: 'floating-point functions', 'calls-all': 'all functions',
      'loops-med': 'median, floating-point functions', 'loops-all-med': 'median, all functions',
      'conds-med': 'median, floating-point functions', 'conds-all-med': 'median, all functions',
      'calls-med': 'median, floating-point functions', 'calls-all-med': 'median, all functions',
    },
    rows: [
      { label: 'C', transc: 10,
        'words': 61, 'words-q1': 26, 'words-q3': 147, 'words-all': 42, 'words-all-q1': 22, 'words-all-q3': 82,
        'params': 3, 'params-q1': 1, 'params-q3': 5, 'params-all': 2, 'params-all-q1': 1, 'params-all-q3': 3,
        loops: 36, 'loops-all': 18, 'loops-med': 2, 'loops-q1': 1, 'loops-q3': 3, 'loops-all-med': 1, 'loops-all-q1': 1, 'loops-all-q3': 2,
        conds: 57, 'conds-all': 66, 'conds-med': 3, 'conds-q1': 2, 'conds-q3': 8, 'conds-all-med': 2, 'conds-all-q1': 1, 'conds-all-q3': 4,
        calls: 84, 'calls-all': 91, 'calls-med': 5, 'calls-q1': 1, 'calls-q3': 13, 'calls-all-med': 4, 'calls-all-q1': 2, 'calls-all-q3': 8 },
      { label: 'C++', transc: 6,
        'words': 42, 'words-q1': 15, 'words-q3': 109, 'words-all': 26, 'words-all-q1': 14, 'words-all-q3': 54,
        'params': 2, 'params-q1': 1, 'params-q3': 3, 'params-all': 2, 'params-all-q1': 1, 'params-all-q3': 3,
        loops: 22, 'loops-all': 13, 'loops-med': 2, 'loops-q1': 1, 'loops-q3': 3, 'loops-all-med': 1, 'loops-all-q1': 1, 'loops-all-q3': 2,
        conds: 44, 'conds-all': 37, 'conds-med': 3, 'conds-q1': 1, 'conds-q3': 6, 'conds-all-med': 2, 'conds-all-q1': 1, 'conds-all-q3': 4,
        calls: 76, 'calls-all': 81, 'calls-med': 6, 'calls-q1': 2, 'calls-q3': 16, 'calls-all-med': 3, 'calls-all-q1': 1, 'calls-all-q3': 8 },
      { label: 'C#', transc: 5.7,
        'words': 34, 'words-q1': 17, 'words-q3': 80, 'words-all': 23, 'words-all-q1': 12, 'words-all-q3': 39,
        'params': 2, 'params-q1': 1, 'params-q3': 3, 'params-all': 1, 'params-all-q1': 0, 'params-all-q3': 2,
        loops: 15, 'loops-all': 5.5, 'loops-med': 1, 'loops-q1': 1, 'loops-q3': 2, 'loops-all-med': 1, 'loops-all-q1': 1, 'loops-all-q3': 2,
        conds: 42, 'conds-all': 29, 'conds-med': 2, 'conds-q1': 1, 'conds-q3': 5, 'conds-all-med': 2, 'conds-all-q1': 1, 'conds-all-q3': 3,
        calls: 73, 'calls-all': 74, 'calls-med': 3, 'calls-q1': 1, 'calls-q3': 8, 'calls-all-med': 2, 'calls-all-q1': 1, 'calls-all-q3': 4 },
      { label: 'Go', transc: 3.4,
        'words': 42, 'words-q1': 17, 'words-q3': 114, 'words-all': 28, 'words-all-q1': 13, 'words-all-q3': 58,
        'params': 2, 'params-q1': 1, 'params-q3': 3, 'params-all': 2, 'params-all-q1': 1, 'params-all-q3': 3,
        loops: 29, 'loops-all': 15, 'loops-med': 2, 'loops-q1': 1, 'loops-q3': 3, 'loops-all-med': 1, 'loops-all-q1': 1, 'loops-all-q3': 2,
        conds: 63, 'conds-all': 54, 'conds-med': 2, 'conds-q1': 1, 'conds-q3': 5, 'conds-all-med': 2, 'conds-all-q1': 1, 'conds-all-q3': 3,
        calls: 85, 'calls-all': 80, 'calls-med': 6, 'calls-q1': 3, 'calls-q3': 17, 'calls-all-med': 4, 'calls-all-q1': 2, 'calls-all-q3': 10 },
      { label: 'Java', transc: 4.6,
        'words': 28, 'words-q1': 10, 'words-q3': 71, 'words-all': 13, 'words-all-q1': 7, 'words-all-q3': 32,
        'params': 1, 'params-q1': 0, 'params-q3': 2, 'params-all': 1, 'params-all-q1': 0, 'params-all-q3': 1,
        loops: 20, 'loops-all': 9.9, 'loops-med': 1, 'loops-q1': 1, 'loops-q3': 2, 'loops-all-med': 1, 'loops-all-q1': 1, 'loops-all-q3': 2,
        conds: 37, 'conds-all': 24, 'conds-med': 2, 'conds-q1': 1, 'conds-q3': 4, 'conds-all-med': 1, 'conds-all-q1': 1, 'conds-all-q3': 3,
        calls: 73, 'calls-all': 61, 'calls-med': 5, 'calls-q1': 2, 'calls-q3': 12, 'calls-all-med': 3, 'calls-all-q1': 1, 'calls-all-q3': 7 },
      { label: 'TypeScript', transc: 1.6,
        'words': 27, 'words-q1': 14, 'words-q3': 57, 'words-all': 17, 'words-all-q1': 8, 'words-all-q3': 36,
        'params': 1, 'params-q1': 1, 'params-q3': 2, 'params-all': 1, 'params-all-q1': 0, 'params-all-q3': 2,
        loops: 15, 'loops-all': 6.8, 'loops-med': 1, 'loops-q1': 1, 'loops-q3': 2, 'loops-all-med': 1, 'loops-all-q1': 1, 'loops-all-q3': 1,
        conds: 44, 'conds-all': 33, 'conds-med': 2, 'conds-q1': 1, 'conds-q3': 4, 'conds-all-med': 1, 'conds-all-q1': 1, 'conds-all-q3': 3,
        calls: 83, 'calls-all': 76, 'calls-med': 3, 'calls-q1': 1, 'calls-q3': 7, 'calls-all-med': 2, 'calls-all-q1': 1, 'calls-all-q3': 5 },
      { label: 'FPBench', transc: 38,
        'words': 23, 'words-q1': 13, 'words-q3': 39, 'words-all': null, 'words-all-q1': null, 'words-all-q3': null,
        'params': 2, 'params-q1': 1, 'params-q3': 3, 'params-all': null, 'params-all-q1': null, 'params-all-q3': null,
        loops: 12, 'loops-all': null, 'loops-med': 1, 'loops-q1': 1, 'loops-q3': 1, 'loops-all-med': null, 'loops-all-q1': null, 'loops-all-q3': null,
        conds: 6.9, 'conds-all': null, 'conds-med': 1, 'conds-q1': 1, 'conds-q3': 2, 'conds-all-med': null, 'conds-all-q1': null, 'conds-all-q3': null,
        calls: 61, 'calls-all': null, 'calls-med': 2, 'calls-q1': 1, 'calls-q3': 2, 'calls-all-med': null, 'calls-all-q1': null, 'calls-all-q3': null },
    ],
  },

  /* Table 5. Share of functions mentioning each precision. A function can
     mention several. TypeScript is excluded: it has a single number type. */
  precision: {
    names: { single: 'single precision', double: 'double precision' },
    rows: [
      { label: 'C', half: 2.7, single: 41, double: 52, quad: 1.9, mixed: 6.5 },
      { label: 'C++', half: 0.1, single: 60, double: 38, quad: 0.7, mixed: 3.9 },
      { label: 'C#', half: null, single: 65, double: 35, quad: null, mixed: 2.7 },
      { label: 'Go', half: null, single: 23, double: 82, quad: null, mixed: 8.5 },
      { label: 'Java', half: null, single: 37, double: 65, quad: null, mixed: 3.8 },
    ],
  },

  /* Table 6. Share of files with floating-point keywords that use each module.
     math.h is the C standard maths header. */
  libraries: {
    names: { 'files-c': 'C files', 'files-cpp': 'C++ files' },
    rows: [
      { label: 'math.h', 'files-c': 17, 'files-cpp': 14 },
      { label: 'GSL Math', 'files-c': 0.084, 'files-cpp': 0.023 },
      { label: 'GSL Special functions', 'files-c': 0.071, 'files-cpp': 0.027 },
      { label: 'GSL Statistics', 'files-c': 0.022, 'files-cpp': 0.0034 },
    ],
  },

  /* Section 6. Share of the 59 extracted C benchmarks using each construct. */
  constructs: {
    names: { share: 'of the benchmarks' },
    rows: [
      { label: 'Mixed parameter types', share: 66 },
      { label: 'Pointer manipulation', share: 63 },
      { label: 'Explicit type casts', share: 41 },
      { label: 'Structs or unions', share: 37 },
      { label: 'Macros', share: 31 },
      { label: 'Calls to helper functions', share: 29 },
    ],
  },
};
