/*
 * MSL layer
 * --------------------------------------------------------------------------
 * Dataset-specific styling and popup content for Mean Sea Level contours derived
 * by DEA Coastlines approach.
 * 
 * MDH, November 2026
 */

import "../styles/Popup.css";
import { HIGHLIGHTED_EXPRESSION, addGeoJsonLineLayers } from "../map/LayerFactory.js";
import { registerLineInteractions } from "../map/Interactions.js";
import { appendPopupField, createPopupContainer } from "../popups/PopupContent.js";

export function getMSLPaint(colours, fallbackYear = 1988) {
  const colourExpression = [
    "interpolate", ["linear"],
    ["to-number", ["get", "year"], fallbackYear],
  ];
  colours.forEach(([year, colour]) => colourExpression.push(year, colour));
  return {
    "line-color": colourExpression,
    "line-width": ["case", HIGHLIGHTED_EXPRESSION, 5, 2],
    "line-opacity": ["case", HIGHLIGHTED_EXPRESSION, 1, 0.8],
  };
}

export function addMSLLayers(map, datasets, colours) {
  addGeoJsonLineLayers(map, datasets, {
    paint: getMSLPaint(colours),
    halo: { width: 9 },
  });
}

function createMSLPopupContent(properties) {
  const container = createPopupContainer("msl-popup", "Satellite-derived MSL shoreline");
  appendPopupField(container, "Year", properties.year);
  appendPopupField(container, "Certainty", properties.certainty);
  appendPopupField(container, "Shoreline ID", properties.shoreline_id);
  appendPopupField(container, "Tidal datum", properties.tide_datum);
  appendPopupField(container, "Tidal model", properties.tide_model);
  appendPopupField(container, "Method", properties.method);
  return container;
}

export function registerMSLInteractions(map, datasets, PopupClass) {
  registerLineInteractions(map, datasets, PopupClass, createMSLPopupContent);
}
