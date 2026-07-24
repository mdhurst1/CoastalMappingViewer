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
 * Declare datasets that will be plotted here
 * --------------------------------------------------------------------------
 */
// MHWS datasets
const MHWS_DATASETS = [
  {
    id: "MHWS 1890",
    file: "/data/montrose_MHWS_1890.geojson",
  },
  {
    id: "MHWS 1970",
    file: "/data/montrose_MHWS_1970.geojson",
  },
  {
    id: "MHWS LiDAR",
    file: "/data/montrose_MHWS_Modern_LiDAR.geojson",
  }
];

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
 * Add MHWS Layer
 * --------------------------------------------------------------------------
 * Adds the Mean High Water Springs shoreline GeoJSON to the map.
 */

// function to get MHWS colour based on year attribute
function getMHWSPaint() {
  return {
    "line-color": [
      "interpolate",
      ["linear"],
      ["to-number", ["slice", ["get", "Date"], 0, 4]],

      1900, "#3f3f3f",
      1970, "#a8cbff",
      2000, "#408dff",
      2026, "#0011a8",
    ],

    "line-width": 2,
  };
}

function addMHWSLayer(map) {
  
  // loop through MHWS Layers
  MHWS_DATASETS.forEach((dataset) => {
    
    const sourceId = `${dataset.id}-source`;
    const layerId = `${dataset.id}-line`;

    // Register the GeoJSON file as a MapLibre data source
    map.addSource(sourceId, {
      type: "geojson",
      data: dataset.file,
    });
  

    // Draw the shoreline source as a line layer
    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,

      layout: {
        "line-cap": "round",
        "line-join": "round",
      },

      paint: getMHWSPaint(),
    });
  });
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
    addMHWSLayer(map);
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