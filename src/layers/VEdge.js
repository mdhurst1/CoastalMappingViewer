/*
 * Vegetation-edge layer
 * --------------------------------------------------------------------------
 * Dataset-specific styling and popup content for vegetation-edge shorelines.
 */

import "../styles/Popup.css";
import {
  HIGHLIGHTED_EXPRESSION,
  addGeoJsonLineLayers,
} from "./LineLayer.js";
import { registerLineInteractions } from "./LineInteractions.js";
import {
  appendPopupField,
  createPopupContainer,
} from "./PopupContent.js";

export function getVEdgePaint(colours, fallbackYear) {
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

export function addVEdgeLayers(map, datasets, colours, fallbackYear) {
  addGeoJsonLineLayers(map, datasets, {
    paint: getVEdgePaint(colours, fallbackYear),
    halo: { width: 7 },
  });
}

function createVEdgePopupContent(properties) {
  const container = createPopupContainer(
    "vedge-popup",
    "Vegetation-edge shoreline",
  );

  appendPopupField(container, "Date", properties.Date);
  appendPopupField(container, "Source", properties.Organisati);

  return container;
}

export function registerVEdgeInteractions(map, datasets, PopupClass) {
  registerLineInteractions(
    map,
    datasets,
    PopupClass,
    createVEdgePopupContent,
  );
}
