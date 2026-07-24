/* 
 * --------------------------------------------
 * Webmap for visualising coastal data and results of coastal mapping tools
 * 
 * MDH, July 2026
 *--------------------------------------------
 */



// import MapLibre and its default style
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// import application specific stylesheet
import "./style.css";

/* 
 * --------------------------------------------
 * Map Configuration
 * - General map settings go here
 *--------------------------------------------
 */

const MAP_CONFIG = {container: "map", centre: [-2.45, 56.73], zoom: 12};

/*
 * Basemap style
 * --------------------------------------------------------------------------
 * MapLibre styles contain:
 *
 * 1. Sources: where the geographic data comes from.
 * 2. Layers: how those data sources should be displayed.
 *
 * This style currently contains only an OpenStreetMap raster basemap.
 */

const BASEMAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png",],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{
      id: "osm-basemap",
      type: "raster",
      source: "osm",
    },
  ],
};

/*
 * Create the map
 * --------------------------------------------------------------------------
 */

function createMap() {
  return new maplibregl.Map({
    container: MAP_CONFIG.container,
    style: BASEMAP_STYLE,
    center: MAP_CONFIG.centre,
    zoom: MAP_CONFIG.zoom,
  });
}

/*
 * Map controls
 * --------------------------------------------------------------------------
 */

function addMapControls(map) {
  // Zoom, rotation and compass controls
  map.addControl(
    new maplibregl.NavigationControl(),
    "top-right",
  );

  // Metric scale bar
  map.addControl(
    new maplibregl.ScaleControl({
      maxWidth: 150,
      unit: "metric",
    }),
    "bottom-left",
  );
}

/*
 * Map event handlers
 * --------------------------------------------------------------------------
 */

function registerMapEvents(map) {
  map.on("load", () => {
    console.log("Map loaded successfully");

    /*
     * Coastal data sources and layers will eventually be added here.
     *
     * For example:
     *
     * addCoastalData(map);
     */
  });

  map.on("error", (event) => {
    console.error("MapLibre error:", event.error);
  });
}


/*
 * Application initialisation
 * --------------------------------------------------------------------------
 */

function initialiseApplication() {
  console.log("Initialising Coastal Mapping Viewer");

  const map = createMap();

  addMapControls(map);
  registerMapEvents(map);

  return map;
}


/*
 * Start the application
 * --------------------------------------------------------------------------
 */

const map = initialiseApplication();