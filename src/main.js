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
import {addAssetLayers, applyAssetVisibility} from "./layers/Assets.js";
import {addMHWSLayers, registerMHWSInteractions} from "./layers/MHWS.js";
import {addVEdgeLayers, registerVEdgeInteractions} from "./layers/VEdge.js";
import {addTransectLayers, registerTransectInteractions} from "./layers/Transects.js";
import {addFutureMHWSLayer, updateFutureMHWS, updateFutureMHWSStyle, setFutureMHWSVisibility} from "./layers/FutureMHWS.js";
import {addFutureUncertaintyLayer, updateFutureUncertainty, updateFutureUncertaintyStyle, setFutureUncertaintyVisibility,} from "./layers/FutureMHWSUncertainty.js";
import {setDatasetVisibility} from "./map/LayerFactory.js";

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
    id: "Transects",
    file: "/CMT_output/Montrose_Transects.geojson",
  }
]

const FUTURE_DATASETS = [
  {
    id: "MHWS_Future",
  }
]

const FUTURE_UNCERTAINTY_DATASETS = [
  {
    id: "MHWS_Future_Uncertainty",
  }
]

// get uncertainty file based on state attributes
const FUTURE_SCENARIO_FILE_CODES = {
  RCP26: "RCP2",
  RCP45: "RCP4",
  RCP85: "RCP8",
};

function getFutureMHWSDataset({ scenario, indicator }) {
  const scenarioCode =
    FUTURE_SCENARIO_FILE_CODES[scenario];

  if (!scenarioCode) {
    return null;
  }

  return {
    id: `${indicator}_Future`,
    file:
      `/CMT_output/Future/` +
      `Montrose_Future_${scenarioCode}_P50.geojson`,
  };
}

function getFutureUncertaintyDataset({scenario, indicator, year, }) {
  
  const scenarioCode =
    FUTURE_SCENARIO_FILE_CODES[scenario];

  if (!scenarioCode) {
    return null;
  }
  
  return {
    id: `${indicator}_Future_Uncertainty`,
    file: `/CMT_output/Future/Montrose_Uncertainty_${scenarioCode}_${year}.geojson`,
  }
}

/*
 * Future layer state
 * --------------------------------------------------------------------------
 * Stored here so visibility can be restored after changing basemap style.
 */

let futureState = {
  scenario: "None",
  indicator: "MHWS",
  year: 2030,
};

/*
 * Asset layer state
 * --------------------------------------------------------------------------
 * Stored here so visibility can be restored after changing basemap style.
 */

let assetState = {
  buildings: false,
  roads: false,
  railways: false,
};

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
const TRANSECT_COLOURS = [
  [-5, "#b2182b"],
  [-2.5, "#ef8a62"],
  [0.0, "#f7f7f7"],
  [2.5, "#67a9cf"],
  [5, "#2166ac"],
];

// initiate legend items
const LEGEND_ITEMS = [
  {
    group: "mhws",
    type: "gradient",
    title: "MHWS shorelines",
    colours: MHWS_COLOURS,
  },
  {
    group: "vegetation",
    type: "gradient",
    title: "Vegetation edge",
    colours: VEDGE_COLOURS,
  },
  {
    group: "transects",
    type: "gradient",
    title: "Historical shoreline change (m/yr)",
    colours: TRANSECT_COLOURS,
    leftLabel: "Erosion",
    rightLabel: "Accretion",
    units: "m/yr",
  },
];

const LAYER_GROUPS = {
  mhws: {
    name: "MHWS shorelines",
    visible: false,
    datasets: MHWS_DATASETS,
    colours: MHWS_COLOURS,
    addLayers: addMHWSLayers,
    registerInteractions: registerMHWSInteractions,
  },

  vegetation: {
    name: "Vegetation edge",
    visible: false,
    datasets: VEDGE_DATASETS,
    colours: VEDGE_COLOURS,
    addLayers: addVEdgeLayers,
    registerInteractions: registerVEdgeInteractions,
  },
  transects: {
    name: "Transects",
    visible: true,
    datasets: TRANSECTS_DATASETS,
    colours: TRANSECT_COLOURS,
    addLayers: addTransectLayers,
    registerInteractions: registerTransectInteractions,
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
 * Apply the current future shoreline state
 * --------------------------------------------------------------------------
 * Controls visibility and data for the future MHWS line and its uncertainty
 * polygon.
 */
function applyFutureState(map) {
  const visible = futureState.scenario !== "None";

  setFutureMHWSVisibility(map, FUTURE_DATASETS[0], visible);
  setFutureUncertaintyVisibility(map, FUTURE_UNCERTAINTY_DATASETS[0], visible);

  if (!visible) {
    return;
  }

  const selectedFutureDataset =  getFutureMHWSDataset(futureState);

  if (selectedFutureDataset) {
    updateFutureMHWS(map, FUTURE_DATASETS[0], selectedFutureDataset, futureState.year);
    updateFutureMHWSStyle(map, FUTURE_DATASETS[0], futureState.scenario);
  }

  const selectedUncertaintyDataset = getFutureUncertaintyDataset(futureState);

  if (selectedUncertaintyDataset) {
    updateFutureUncertainty(map, FUTURE_UNCERTAINTY_DATASETS[0], selectedUncertaintyDataset);
    updateFutureUncertaintyStyle(map, FUTURE_UNCERTAINTY_DATASETS[0], futureState.scenario);
  }
}

/*
 * Map controls
 * --------------------------------------------------------------------------
 */
function addMapControls(map) {
  map.addControl(
    new maplibregl.NavigationControl(),
    "top-right",
  );

  map.addControl(
    new maplibregl.ScaleControl({
      maxWidth: 150,
      unit: "metric",
    }),
    "bottom-left",
  );

  const legendControl = new LegendControl(LEGEND_ITEMS);

  const updateAssetVisibility = (newAssetState) => {
    assetState = {...newAssetState,};
  
    applyAssetVisibility(map, assetState);
  };
  
  const updateVisibleLayers = () => {
    applyLayerVisibility(map);
    legendControl.updateVisibility(LAYER_GROUPS);
  };

  const updateFutureShoreline = (state) => {
    futureState = { ...state };

    applyFutureState(map);
  };

  const mapOptionsControl = new MapOptionsControl(
    BASEMAPS,
    MAP_CONFIG.basemap,
    LAYER_GROUPS,
    updateAssetVisibility,
    updateVisibleLayers,
    updateFutureShoreline,
  );

  map.addControl(
    mapOptionsControl,
    "top-left",
  );

  map.addControl(
    legendControl,
    "bottom-right",
  );

  // Apply the initial legend state
  legendControl.updateVisibility(LAYER_GROUPS);
}

/*
 * Map event handlers
 * --------------------------------------------------------------------------
 */

function registerMapEvents(map) {
  map.on("style.load", () => {
    
    addAssetLayers(map);
    Object.values(LAYER_GROUPS).forEach(
      (group) => {
        group.addLayers(
          map,
          group.datasets,
          group.colours,
          CURRENT_YEAR,
        );
      },
    );

    applyAssetVisibility(map, assetState);
    applyLayerVisibility(map);
    addFutureMHWSLayer(map, FUTURE_DATASETS[0], futureState.year);
    addFutureUncertaintyLayer(map, FUTURE_UNCERTAINTY_DATASETS[0]);
    applyFutureState(map);
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
    group.datasets.forEach((dataset) => {
      setDatasetVisibility(map, dataset, group.visible);
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
  Object.values(LAYER_GROUPS).forEach((group) => {
    group.registerInteractions(
      map,
      group.datasets,
      maplibregl.Popup,
    );
  });
  return map;
}


/*
 * Start the application
 * --------------------------------------------------------------------------
 */

const map = initialiseApplication();