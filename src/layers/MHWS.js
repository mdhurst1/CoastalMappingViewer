/*
 * MHWS layer
 * --------------------------------------------------------------------------
 * Dataset-specific styling and popup content for Mean High Water Springs.
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

export function getMHWSPaint(colours, fallbackYear) {
  const colourExpression = [
    "interpolate",
    ["linear"],
    [
      "to-number",
      ["slice", ["to-string", ["get", "Date"]], 0, 4],
      fallbackYear,
    ],
  ];

  colours.forEach(([year, colour]) => {
    colourExpression.push(year, colour);
  });

  return {
    "line-color": colourExpression,
    "line-width": ["case", HIGHLIGHTED_EXPRESSION, 5, 2],
    "line-opacity": ["case", HIGHLIGHTED_EXPRESSION, 1, 0.8],
  };
}

export function addMHWSLayers(map, datasets, colours, fallbackYear) {
  addGeoJsonLineLayers(map, datasets, {
    paint: getMHWSPaint(colours, fallbackYear),
    halo: { width: 9 },
  });
}

function createMHWSPopupContent(properties) {
  const container = createPopupContainer(
    "mhws-popup",
    "MHWS shoreline",
  );

  appendPopupField(container, "Date", properties.Date);
  appendPopupField(container, "Source", properties.Data_D);

  return container;
}

export function registerMHWSInteractions(map, datasets, PopupClass) {
  registerLineInteractions(
    map,
    datasets,
    PopupClass,
    createMHWSPopupContent,
  );
}
