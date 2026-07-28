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
  file,
  initialYear = 2030,
) {
  if (!map.getSource(FUTURE_MHWS_SOURCE_ID)) {
    map.addSource(FUTURE_MHWS_SOURCE_ID, {
      type: "geojson",
      data: file,
      generateId: true,
    });
  }

  if (!map.getLayer(FUTURE_MHWS_LAYER_ID)) {
    map.addLayer({
      id: FUTURE_MHWS_LAYER_ID,
      type: "line",
      source: FUTURE_MHWS_SOURCE_ID,

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
export function updateFutureMHWSYear(map, year) {
  if (!map.getLayer(FUTURE_MHWS_LAYER_ID)) {
    console.warn(
      "Cannot update future MHWS year: layer has not been added.",
    );

    return;
  }

  map.setFilter(
    FUTURE_MHWS_LAYER_ID,
    getFutureMHWSFilter(year),
  );
}