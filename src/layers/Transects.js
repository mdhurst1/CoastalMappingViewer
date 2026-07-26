/*
 * Transect layer
 * --------------------------------------------------------------------------
 * Dataset-specific styling and popup content for shoreline-change transects.
 */

import "./Popup.css";
import {
  HIGHLIGHTED_EXPRESSION,
  addGeoJsonLineLayers,
} from "./LineLayer.js";
import { registerLineInteractions } from "./LineInteractions.js";
import {
  appendPopupField,
  createPopupContainer,
} from "./PopupContent.js";

const MIN_RATE = -5;
const MAX_RATE = 5;

export function getTransectPaint() {
  return {
    "line-color": [
      "interpolate",
      ["linear"],
      ["to-number", ["get", "Hist_Rate"], 0],
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

function createTransectPopupContent(properties) {
  const transectId = properties.TransectID ?? "Unknown";
  const container = createPopupContainer(
    "transect-popup",
    `Transect ID: ${transectId}`,
  );

  const rate = Number(properties.Hist_Rate);
  const formattedRate = Number.isFinite(rate)
    ? rate.toFixed(2)
    : "Unknown";

  appendPopupField(
    container,
    "Historic rate",
    formattedRate,
    {
      suffix: Number.isFinite(rate) ? " m/yr" : "",
      element: "div",
    },
  );

  return container;
}

export function registerTransectInteractions(map, datasets, PopupClass) {
  registerLineInteractions(
    map,
    datasets,
    PopupClass,
    createTransectPopupContent,
  );
}
