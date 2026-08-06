/*
 * Transect layer
 * --------------------------------------------------------------------------
 * Dataset-specific styling and popup content for shoreline-change transects.
 */

//layers and interactions
import {HIGHLIGHTED_EXPRESSION, addGeoJsonLineLayers} from "../map/LayerFactory.js";
import { registerLineInteractions } from "../map/Interactions.js";

// popup imports
import "../styles/Popup.css";
import {createTransectPopupContent, plotTransectTimeseries} from "../popups/TransectsPopup.js";
import {appendPopupField, createPopupContainer} from "../popups/PopupContent.js";

const MIN_RATE = -5;
const MAX_RATE = 5;

const twrRateExpression = [
    "get",
    "Rate",
    [
        "get",
        "TWR",
        [
            "get",
            "Results",
            [
                "get",
                "MHWS",
                ["get", "Timeseries"],
            ],
        ],
    ],
];

export function getTransectPaint() {
  return {
    "line-color": [
      "interpolate",
      ["linear"],
      twrRateExpression,
      MIN_RATE, "#b2182b",
      -2.5, "#ef8a62",
      0, "#f7f7f7",
      2.5, "#67a9cf",
      MAX_RATE, "#2166ac",
    ],
    "line-width": ["case", HIGHLIGHTED_EXPRESSION, 5, 2],
    "line-opacity": ["case", HIGHLIGHTED_EXPRESSION, 1, 0.8],
  };
}

export function addTransectLayers(map, datasets) {
  addGeoJsonLineLayers(map, datasets, {
    paint: getTransectPaint(),
    halo: { width: 9 },
  });
}

export function registerTransectInteractions(map, datasets, PopupClass) {
  registerLineInteractions(
    map,
    datasets,
    PopupClass,
    createTransectPopupContent,
  );
}
