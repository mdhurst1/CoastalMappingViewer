import {MHWS_COLOURS, MSL_COLOURS, VEDGE_COLOURS, TRANSECT_COLOURS, DEA_RATE_COLOURS} from "../layers/LayerStyles.js";
import {MHWS_DATASETS, MSL_DATASETS, VEDGE_DATASETS, TRANSECTS_DATASETS, DEA_RATE_DATASETS} from "./DatasetConfig.js";
import {addMHWSLayers, registerMHWSInteractions} from "../layers/MHWS.js";
import {addVEdgeLayers, registerVEdgeInteractions} from "../layers/VEdge.js";
import {addTransectLayers, registerTransectInteractions} from "../layers/Transects.js";
import {addTideGaugeLayer, registerTideGaugeInteractions} from "../layers/Marine.js";
import {addMSLLayers, registerMSLInteractions} from "../layers/DEA_MSL.js";
import {addDEARateLayers, registerDEARateInteractions} from "../layers/DEA_Rates.js";

export const LAYER_GROUPS = {
  mhws: {
    name: "MHWS shorelines",
    visible: false,
    datasets: MHWS_DATASETS,
    colours: MHWS_COLOURS,
    addLayers: addMHWSLayers,
    registerInteractions: registerMHWSInteractions,
  },

  msl: {
    name: "Satellite-derived MSL shorelines",
    visible: false,
    datasets: MSL_DATASETS,
    colours: MSL_COLOURS,
    addLayers: addMSLLayers,
    registerInteractions: registerMSLInteractions,
  },

  dea_rates: {
    name: "DEA MSL change rates (multiscale)",
    visible: false,
    datasets: DEA_RATE_DATASETS,
    colours: DEA_RATE_COLOURS,
    addLayers: addDEARateLayers,
    registerInteractions: registerDEARateInteractions,
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