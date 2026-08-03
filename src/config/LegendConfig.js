// import colours from layer styles file saved in layers folder
import {MHWS_COLOURS, VEDGE_COLOURS, TRANSECT_COLOURS} from "../layers/LayerStyles.js";

// initiate legend items
export const LEGEND_ITEMS = [
  {
    group: "mhws",
    type: "gradient",
    title: "MHWS shorelines",
    colours: MHWS_COLOURS,
  },
  {
    group: "vegetation",
    type: "gradient",
    title: "Vegetation edge",
    colours: VEDGE_COLOURS,
  },
  {
    group: "transects",
    type: "gradient",
    title: "Historical shoreline change (m/yr)",
    colours: TRANSECT_COLOURS,
    leftLabel: "Erosion",
    rightLabel: "Accretion",
    units: "m/yr",
  },
];