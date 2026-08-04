/*
 * Marine data layers
 * --------------------------------------------------------------------------
 * Functions for adding and controlling marine datasets displayed in the
 * Coastal Mapping Viewer.
 *
 * The first marine dataset is a collection of tide-gauge locations stored as
 * GeoJSON point features.
 *
 * MDH, August 2026
 */

//import modules
import { registerPointInteractions } from "../map/Interactions.js";

// popup imports
import "../styles/Popup.css";
import { createTideGaugePopup } from "../popups/TideGaugePopup.js";

/*
 * Tide-gauge layer identifiers
 * --------------------------------------------------------------------------
 * These IDs are used internally by MapLibre to identify the GeoJSON source
 * and the rendered circle layer.
 */

const TIDE_GAUGE_SOURCE_ID = "tide-gauges-source";
const TIDE_GAUGE_LAYER_ID = "tide-gauges-circle";

/*
 * Add tide-gauge layer
 * --------------------------------------------------------------------------
 */

/**
 * Add the tide-gauge GeoJSON source and point layer to the map.
 *
 * The layer is initially hidden. Its visibility is controlled separately
 * using setTideGaugeVisibility().
 *
 * @param {maplibregl.Map} map - MapLibre map instance.
 * @param {Object} dataset - Tide-gauge dataset configuration.
 * @param {string} dataset.file - URL of the GeoJSON file.
 */
export function addTideGaugeLayer(map, dataset) {
  /*
   * Add the GeoJSON source.
   *
   * A source only needs to be added once. The check is useful because this
   * function will run again whenever the basemap style changes.
   */
  if (!map.getSource(TIDE_GAUGE_SOURCE_ID)) {
    map.addSource(TIDE_GAUGE_SOURCE_ID, {
      type: "geojson",
      data: dataset.file,
    });
  }

  /*
   * Add the visible MapLibre layer.
   *
   * The source contains points, so a circle layer is used to display them.
   */
  if (!map.getLayer(TIDE_GAUGE_LAYER_ID)) {
    map.addLayer({
      id: TIDE_GAUGE_LAYER_ID,
      type: "circle",
      source: TIDE_GAUGE_SOURCE_ID,

      layout: {
        visibility: "none",
      },

      paint: {
        "circle-radius": 6,
        "circle-color": "#ffffff",
        "circle-stroke-color": "#005a8d",
        "circle-stroke-width": 2,
      },
    });
  }
}


/*
 * Set tide-gauge visibility
 * --------------------------------------------------------------------------
 */

/**
 * Show or hide the tide-gauge layer.
 *
 * @param {maplibregl.Map} map - MapLibre map instance.
 * @param {boolean} visible - Whether the layer should be visible.
 */
export function setTideGaugeVisibility(
  map,
  visible,
) {
  if (!map.getLayer(TIDE_GAUGE_LAYER_ID)) {
    return;
  }

  map.setLayoutProperty(
    TIDE_GAUGE_LAYER_ID,
    "visibility",
    visible ? "visible" : "none",
  );
}


/*
 * Tide gauge popup content
 * --------------------------------------------------------------------------
 */
function createTideGaugePopupContent(properties) {

  const container = document.createElement("div");
  container.className = "Marine-popup";

  const title = document.createElement("div");
  title.className = "Marine-popup-title";
  title.textContent =
    properties.Station_ID ?? "Tide gauge";

  container.appendChild(title);

  addPopupRow(
    container,
    "Network",
    properties.Monitoring_programme,
  );

  addPopupRow(
    container,
    "Organisation",
    properties.Organisation,
  );

  addPopupRow(
    container,
    "Operating period",
    formatOperatingPeriod(properties),
  );

  addPopupRow(
    container,
    "Frequency",
    properties.Frequency,
    " minutes",
  );

  addPopupRow(
    container,
    "Notes",
    properties.Notes,
  );

  return container;
}


/*
 * Format the start and end dates as one value.
 */
function formatOperatingPeriod(properties) {

  const start = properties.Start_date;
  const end = properties.End_date;

  if (start && end) {
    return `${start}–${end}`;
  }

  return start ?? end ?? null;
}


/*
 * Register tide gauge popup interactions.
 * --------------------------------------------------------------------------
 *
 * This should be called once when the application starts, rather than inside
 * style.load, to avoid registering duplicate event handlers.
 */
export function registerTideGaugeInteractions(
  map,
  datasets,
  PopupClass,
) {
  datasets.forEach((dataset) => {
    registerPointInteractions(
      map,
      `${dataset.id}-circle`,
      PopupClass,
      createTideGaugePopup,
    );
  });
}