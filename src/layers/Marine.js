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
 * Register tide-gauge interactions
 * --------------------------------------------------------------------------
 */

/**
 * Register basic mouse interactions for the tide-gauge layer.
 *
 * The popup itself will be added later. For now this changes the cursor so
 * users can see that the points are interactive.
 *
 * @param {maplibregl.Map} map - MapLibre map instance.
 */
export function registerTideGaugeInteractions(map) {
  map.on(
    "mouseenter",
    TIDE_GAUGE_LAYER_ID,
    () => {
      map.getCanvas().style.cursor = "pointer";
    },
  );

  map.on(
    "mouseleave",
    TIDE_GAUGE_LAYER_ID,
    () => {
      map.getCanvas().style.cursor = "";
    },
  );
}