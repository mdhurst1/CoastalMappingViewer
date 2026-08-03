// layers/LayerStyles.js

// setup colour schemes
const CURRENT_YEAR = new Date().getFullYear();

const MHWS_COLOURS = [
  [1900, "#3f3f3f"],
  [1970, "#a8cbff"],
  [2000, "#408dff"],
  [CURRENT_YEAR, "#0011a8"],
];
const VEDGE_COLOURS = [
  [2000, "#eeffe9"],
  [CURRENT_YEAR, "#006622"],
];
const TRANSECT_COLOURS = [
  [-5, "#b2182b"],
  [-2.5, "#ef8a62"],
  [0.0, "#f7f7f7"],
  [2.5, "#67a9cf"],
  [5, "#2166ac"],
];



const LAYER_GROUPS = {
  mhws: {
    name: "MHWS shorelines",
    visible: false,
    datasets: MHWS_DATASETS,
    colours: MHWS_COLOURS,
    addLayers: addMHWSLayers,
    registerInteractions: registerMHWSInteractions,
  },

  vegetation: {
    name: "Vegetation edge",
    visible: false,
    datasets: VEDGE_DATASETS,
    colours: VEDGE_COLOURS,
    addLayers: addVEdgeLayers,
    registerInteractions: registerVEdgeInteractions,
  },
  transects: {
    name: "Transects",
    visible: true,
    datasets: TRANSECTS_DATASETS,
    colours: TRANSECT_COLOURS,
    addLayers: addTransectLayers,
    registerInteractions: registerTransectInteractions,
  },
};