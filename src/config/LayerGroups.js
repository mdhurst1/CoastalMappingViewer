import {MHWS_COLOURS,VEDGE_COLOURS, TRANSECT_COLOURS} from "../layers/LayerStyles.js";
import {MHWS_DATASETS, VEDGE_DATASETS, TRANSECTS_DATASETS, TIDE_GAUGE_DATASET} from "./DatasetConfig.js";
import {addMHWSLayers, registerMHWSInteractions} from "../layers/MHWS.js";
import {addVEdgeLayers, registerVEdgeInteractions} from "../layers/VEdge.js";
import {addTransectLayers, registerTransectInteractions} from "../layers/Transects.js";
import {addTideGaugeLayer, registerTideGaugeInteractions} from "../layers/Marine.js";

export const LAYER_GROUPS = {
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
    visible: false,
    datasets: TRANSECTS_DATASETS,
    colours: TRANSECT_COLOURS,
    addLayers: addTransectLayers,
    registerInteractions: registerTransectInteractions,
  },
};