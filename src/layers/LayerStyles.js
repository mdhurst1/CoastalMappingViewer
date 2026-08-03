// layers/LayerStyles.js

// setup colour schemes
const CURRENT_YEAR = new Date().getFullYear();

export const MHWS_COLOURS = [
  [1900, "#3f3f3f"],
  [1970, "#a8cbff"],
  [2000, "#408dff"],
  [CURRENT_YEAR, "#0011a8"],
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
