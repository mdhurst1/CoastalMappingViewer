/*
 * Future MHWS layer
 * --------------------------------------------------------------------------
 * Loads predicted MHWS shorelines and filters them by the selected year.
 *
 * The GeoJSON is loaded once. MapLibre then changes the displayed shoreline
 * by applying a filter to the Year property.
 */

const FUTURE_MHWS_SOURCE_ID = "future-mhws-source";
const FUTURE_MHWS_LAYER_ID = "future-mhws-line";

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
      data: dataset.file,
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
export function updateFutureMHWSYear(
  map,
  dataset,
  year,
) {
  const layerId = `${dataset.id}-line`;

  if (!map.getLayer(layerId)) {
    console.warn(
      `Cannot update ${layerId}: layer has not been added.`,
    );

    return;
  }

  map.setFilter(
    layerId,
    getFutureMHWSFilter(year),
  );
}

export function showFutureMHWS(map, dataset) {
    map.setLayoutProperty(`${dataset.id}-line`, "visibility", "visible");
}

export function hideFutureMHWS(map, dataset) {
    map.setLayoutProperty(`${dataset.id}-line`, "visibility", "none");
}