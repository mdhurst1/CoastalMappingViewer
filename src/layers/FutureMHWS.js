/*
 * Future MHWS layer
 * --------------------------------------------------------------------------
 * Loads predicted MHWS shorelines and filters them by the selected year.
 *
 * The GeoJSON is loaded once. MapLibre then changes the displayed shoreline
 * by applying a filter to the Year property.
 */

// import styles for displaying future MHWS
import {getFutureScenarioStyle} from "./FutureStyles.js";

const EMPTY_GEOJSON = {
  type: "FeatureCollection",
  features: [],
};

/**
 * Convert a numeric year into the date format used by the GeoJSON.
 *
 * For example:
 *     2030 -> "2030-01-01"
 *
 * @param {number} year
 * @returns {string}
 */
function getFutureYearDate(year) {
  return `${year}-01-01`;
}

/**
 * Create the MapLibre filter for a selected future year.
 *
 * @param {number} year
 * @returns {Array}
 */
function getFutureMHWSFilter(year) {
  return [
    "==",
    ["get", "Year"],
    getFutureYearDate(year),
  ];
}

/**
 * Add the future MHWS source and line layer to the map.
 *
 * @param {maplibregl.Map} map
 * @param {string} file
 * @param {number} initialYear
 */
export function addFutureMHWSLayer(
  map,
  dataset,
  initialYear = 2030,
  ) {
  const sourceId = dataset.id;
  const layerId = `${dataset.id}-line`;

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: "geojson",
      data: dataset.file ?? EMPTY_GEOJSON,
      generateId: true,
    });
  }

  if (!map.getLayer(layerId)) {
    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,

      layout: {
        "line-cap": "round",
        "line-join": "round",
      },

      paint: {
        "line-color": "#d73027",
        "line-width": 3,
        "line-opacity": 0.9,
      },

      filter: getFutureMHWSFilter(initialYear),
    });
  }
}

/**
 * Change the future MHWS shoreline displayed on the map.
 *
 * @param {maplibregl.Map} map
 * @param {number} year
 */
export function updateFutureMHWS(
  map,
  layerDataset,
  selectedDataset,
  year,
) {
  const sourceId = layerDataset.id;
  const layerId = `${layerDataset.id}-line`;

  const source = map.getSource(sourceId);

  if (!source) {
    console.warn(
      `Cannot update ${sourceId}: source has not been added.`,
    );

    return;
  }

  source.setData(selectedDataset.file);

  if (map.getLayer(layerId)) {
    map.setFilter(
      layerId,
      getFutureMHWSFilter(year),
    );
  }
}

export function updateFutureMHWSStyle(
  map,
  dataset,
  scenario,
) {
  const layerId = `${dataset.id}-line`;
  const style = getFutureScenarioStyle(scenario);

  if (!style || !map.getLayer(layerId)) {
    return;
  }

  map.setPaintProperty(
    layerId,
    "line-color",
    style.colour,
  );

  map.setPaintProperty(
    layerId,
    "line-width",
    style.shoreline.width,
  );

  map.setPaintProperty(
    layerId,
    "line-opacity",
    style.shoreline.opacity,
  );

  map.setPaintProperty(
    layerId,
    "line-dasharray",
    style.shoreline.dasharray,
  );
}

export function setFutureMHWSVisibility(map, dataset, visible) {
  const layerId = `${dataset.id}-line`;

  if (!map.getLayer(layerId)) {
    return;
  }

  map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
}