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

// import controls
import BasemapControl from "./controls/BasemapControl.js";
import LegendControl from "./controls/LegendControl.js";

/* 
 * --------------------------------------------
 * Map Configuration
 * - General map settings go here
 *--------------------------------------------
 */

const MAP_CONFIG = {
  container: "map", 
  centre: [-2.45, 56.73], 
  zoom: 12,
  basemap: "Positron"
};

/*
 * Basemap definitions
 * --------------------------------------------------------------------------
 * Defines the basemap styles available to the application.
 *
 * Each basemap entry contains:
 *
 * name
 *     Human-readable name displayed in the basemap control.
 *
 * style
 *     Either:
 *
 *     1. A URL pointing to a MapLibre style document; or
 *     2. An inline MapLibre style object.
 *
 * OpenFreeMap provides complete hosted vector styles.
 *
 * Esri World Imagery is configured here as an inline MapLibre style using
 * Esri raster tiles. Attribution is included in the raster source and is
 * displayed by MapLibre's attribution control.
 *
 * Changing basemap calls map.setStyle(), which replaces all sources and
 * layers in the current style. Application-specific layers must therefore
 * be re-added when the new style emits the "style.load" event.
 */

const BASEMAPS = {

  Positron: {
      name: "Light",
      style: "https://tiles.openfreemap.org/styles/positron"
  },

  Dark: {
      name: "Dark",
      style: "https://tiles.openfreemap.org/styles/dark"
  },

  Bright: {
      name: "StreetMap",
      style: "https://tiles.openfreemap.org/styles/bright"
  },

  EsriImagery: {
    name: "Satellite",
    style: {
      version: 8,
      sources: {
        imagery: {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          ],
          tileSize: 256,
          attribution: "© Esri, Maxar, Earthstar Geographics"
        }
      },
      layers: [
        {
          id: "imagery",
          type: "raster",
          source: "imagery"
        }
      ]
    }
  }
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

// setup MHWS colour scheme
const CURRENT_YEAR = new Date().getFullYear();
const MHWS_COLOURS = [
  [1900, "#3f3f3f"],
  [1970, "#a8cbff"],
  [2000, "#408dff"],
  [CURRENT_YEAR, "#0011a8"],
];

/*
 * Create the map
 * --------------------------------------------------------------------------
 */

function createMap() {
  return new maplibregl.Map({
    container: MAP_CONFIG.container,
    style: BASEMAPS[MAP_CONFIG.basemap].style,
    center: MAP_CONFIG.centre,
    zoom: MAP_CONFIG.zoom,
  });
}


/*
 * Set active basemap
 * --------------------------------------------------------------------------
 * Displays the selected basemap layer and hides all other basemap layers.
 *
 * Parameters
 * ----------
 * map : maplibregl.Map
 *    The MapLibre map instance.
 * BasemapName : 
 *    The name of othe basemap layer to get the style from
 */

function setBasemap(map, BasemapName) {
  
  // get the map
  const basemap = BASEMAPS[BasemapName];

  // check it
  if (!basemap) {
    console.error('Unknown basemap: ${BasemapName}');
  }

  // set the map
  map.setStyle(basemap.style);
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

  // Basemap selector
  map.addControl(
    new BasemapControl(BASEMAPS, MAP_CONFIG.basemap),
    "top-left",
  );

  // Layer selector (future)
  // addLayerControl(map);

  // add legend
  /*map.addControl(
    new LegendControl(),
    "bottom-right",
  );
  */
}

/*
 * Add MHWS Layer
 * --------------------------------------------------------------------------
 * Adds the Mean High Water Springs shoreline GeoJSON to the map.
 */

// function to get MHWS colour based on year attribute
function getMHWSPaint() {
  const colourExpression = [
    "interpolate",
    ["linear"],
    [
      "to-number",
      ["slice", ["get", "Date"], 0, 4],
    ],
  ];

  MHWS_COLOURS.forEach(([year, colour]) => {
    colourExpression.push(year, colour);
  });

  return {
    "line-color": colourExpression,
    "line-width": 2,
  };
}

function addMHWSLayer(map) {
  
  // loop through MHWS Layers
  MHWS_DATASETS.forEach((dataset) => {
    
    const sourceId = `${dataset.id}-source`;
    const layerId = `${dataset.id}-line`;

    // Register the GeoJSON file as a MapLibre data source if not already present
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: dataset.file,
      });
    }
  

    // Draw the shoreline source as a line layer if not already present
    if (!map.getLayer(layerId)) {
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
    };
  });
}

/*
 * Map event handlers
 * --------------------------------------------------------------------------
 */

function registerMapEvents(map) {
  map.on("style.load", () => {
    console.log("Map style loaded successfully");

    addMHWSLayer(map);
  });

  map.on("error", (event) => {
    console.error("MapLibre error event:", event);
    console.error("Error:", event.error);
    console.error("Source:", event.sourceId);
    console.error("Tile:", event.tile);
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