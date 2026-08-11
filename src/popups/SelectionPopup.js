/*
 * SelectionPopup
 * --------------------------------------------------------------------------
 * Popup content for polygon-based transect summaries.
 */

import center from "@turf/center";

import {
  appendPopupField,
  createPopupContainer,
} from "./PopupContent.js";


export function createSelectionPopupContent(
  summary,
) {

  const container =
    createPopupContainer(
      "selection-popup",
      "Transect summary",
    );

  appendPopupField(
    container,
    "Transects",
    summary.count,
  );

  appendPopupField(
    container,
    "Mean rate",
    summary.mean?.toFixed(2),
    { suffix: " m/yr" },
  );

  appendPopupField(
    container,
    "Median rate",
    summary.median?.toFixed(2),
    { suffix: " m/yr" },
  );

  appendPopupField(
    container,
    "Minimum rate",
    summary.min?.toFixed(2),
    { suffix: " m/yr" },
  );

  appendPopupField(
    container,
    "Maximum rate",
    summary.max?.toFixed(2),
    { suffix: " m/yr" },
  );

  appendPopupField(
    container,
    "Eroding",
    summary.eroding,
  );

  appendPopupField(
    container,
    "Accreting",
    summary.accreting,
  );

  return container;
}

export function showSelectionPopup(
  map,
  polygon,
  summary,
  PopupClass,
) {

  const content =
    createSelectionPopupContent(summary);

  const location =
    center(polygon).geometry.coordinates;

  new PopupClass()
    .setLngLat(location)
    .setDOMContent(content)
    .addTo(map);
}