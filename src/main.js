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

// import control tools
import MapOptionsControl from "./controls/MapOptionsControl.js";
import LegendControl from "./controls/LegendControl.js";

// import layer tools
import {addMHWSLayers, registerMHWSInteractions} from "./layers/MHWS.js";
import {addVEdgeLayers, registerVEdgeInteractions} from "./layers/VEdge.js";
import { addTransectLayers, registerTransectInteractions } from "./layers/Transects.js";

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

const VEDGE_DATASETS = [
  {
    id: "VEdge Combined",
    file: "/data/Montrose_VEdge_combined.geojson",
  }
]

const TRANSECTS_DATASETS = [
  {
    id: "Transects"
    file: "/CMT_output/Montrose_Transects.geojson"
  }
]
// setup colour schemes
const CURRENT_YEAR = new Date().getFullYear();
const MHWS_COLOURS = [
  [1900, "#3f3f3f"],
  [1970, "#a8cbff"],
  [2000, "#408dff"],
  [CURRENT_YEAR, "#0011a8"],
];
const VEDGE_COLOURS = [
  [2000, "#eeffe9"],
  [CURRENT_YEAR, "#006622"],
];

// initiate legend items
const LEGEND_ITEMS = [
  {
    type: "gradient",
    title: "MHWS shorelines",
    colours: MHWS_COLOURS,
  },
  {
    type: "gradient",
    title: "Vegetation edge",
    colours: VEDGE_COLOURS,
  },
];

const LAYER_GROUPS = {
  mhws: {
    name: "MHWS shorelines",
    visible: true,
    datasets: MHWS_DATASETS,
    colours: MHWS_COLOURS,
    addLayers: addMHWSLayers,
  },

  vegetation: {
    name: "Vegetation edge",
    visible: true,
    datasets: VEDGE_DATASETS,
    colours: VEDGE_COLOURS,
    addLayers: addVEdgeLayers,
  }
  transects: {
    name: "Transects"
    visible: true
    datasets: TRANSECTS_DATASETS
    colours: None,
    addLayers: addTransectLayers,
  },
};
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

  // Map opttion selector for basemaps and layers
  const mapOptionsControl = new MapOptionsControl(
    BASEMAPS,
    MAP_CONFIG.basemap,
    LAYER_GROUPS,
    () => applyLayerVisibility(map),
  );

  map.addControl(
    mapOptionsControl,
    "top-left",
  );

  // add legend
  map.addControl(
    new LegendControl(LEGEND_ITEMS),
    "bottom-right",
  );
}

/*
 * Map event handlers
 * --------------------------------------------------------------------------
 */

function registerMapEvents(map) {
  map.on("style.load", () => {
  
    Object.values(LAYER_GROUPS).forEach((group) => {
      group.addLayers(
        map,
        group.datasets,
        group.colours,
        CURRENT_YEAR,
      );
    });

  applyLayerVisibility(map);
  });
}
/*
 * Apply layer visibility
 * --------------------------------------------------------------------------
 * Applies the visibility settings stored in LAYER_GROUPS to all MapLibre
 * layers belonging to each group.
 */

function applyLayerVisibility(map) {
  Object.values(LAYER_GROUPS).forEach((group) => {
    const visibility = group.visible
      ? "visible"
      : "none";

    group.datasets.forEach((dataset) => {
      const haloLayerId = `${dataset.id}-halo`;
      const lineLayerId = `${dataset.id}-line`;

      [haloLayerId, lineLayerId].forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(
            layerId,
            "visibility",
            visibility,
          );
        }
      });
    });
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
  registerMHWSInteractions(
    map,
    MHWS_DATASETS,
    maplibregl.Popup,
  );
  registerVEdgeInteractions(
    map,
    VEDGE_DATASETS,
    maplibregl.Popup,
  );
  registerTransectInteractions(
    map,
    TRANSECTS_DATASETS,
    maplibregl.Popup,
  )
  return map;
}


/*
 * Start the application
 * --------------------------------------------------------------------------
 */

const map = initialiseApplication();