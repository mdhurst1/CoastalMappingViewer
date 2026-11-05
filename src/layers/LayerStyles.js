// layers/LayerStyles.js

// setup colour schemes
const CURRENT_YEAR = new Date().getFullYear();

export const MHWS_COLOURS = [
  [1900, "#3f3f3f"],
  [1970, "#a8cbff"],
  [2000, "#408dff"],
  [CURRENT_YEAR, "#0011a8"],
];

export const MSL_COLOURS = [
  [1988, "#000004"],
  [1993, "#210C4A"],
  [1998, "#57106E"],
  [2002, "#8A226A"],
  [2007, "#BC3754"],
  [2012, "#E45A31"],
  [2016, "#F98E09"],
  [2021, "#F9C932"],
  [CURRENT_YEAR, "#FCFFA4"],
];

export const VEDGE_COLOURS = [
  [2000, "#eeffe9"],
  [CURRENT_YEAR, "#006622"],
];

export const TRANSECT_COLOURS = [
  [-5, "#b2182b"],
  [-2.5, "#ef8a62"],
  [0.0, "#f7f7f7"],
  [2.5, "#67a9cf"],
  [5, "#2166ac"],
];
