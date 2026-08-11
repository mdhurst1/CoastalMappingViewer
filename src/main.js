/* 
 * -------------------------------------------------------------------------- 
 * Coastal Mapping Viewer
 * -------------------------------------------------------------------------- 
 * Creates and initialises the MapLibre map, adds application controls and 
 * layers, and coordinates changes to the application's current state. 
 * 
 * MDH, July 2026 * 
-------------------------------------------------------------------------- */

// import MapLibre and its default style
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// import application specific stylesheet
import "./style.css";

// import state management functions
import {getAssetState, getFutureState, getMarineState, updateAssetState, updateFutureState, updateMarineState } from "./state/ApplicationState.js";

// import map configurations
import { MapConfig } from "./config/MapConfig.js";
import { Basemaps } from "./config/BasemapConfig.js";
import { TIDE_GAUGE_DATASET, MHWS_DATASETS, VEDGE_DATASETS, TRANSECTS_DATASETS, FUTURE_DATASETS, FUTURE_UNCERTAINTY_DATASETS, FUTURE_SCENARIO_FILE_CODES, getFutureMHWSDataset, getFutureUncertaintyDataset} from "./config/DatasetConfig.js";

import { LEGEND_ITEMS } from "./config/LegendConfig.js";
import { LAYER_GROUPS } from "./config/LayerGroups.js";

// import control tools
import MapOptionsControl from "./controls/MapOptionsControl.js";
import LegendControl from "./controls/LegendControl.js";
import {addMapControls} from "./controls/MapControls.js";

// import layer tools
import {addAssetLayers, applyAssetVisibility} from "./layers/Assets.js";
import {addTideGaugeLayer,registerTideGaugeInteractions,setTideGaugeVisibility,} from "./layers/Marine.js";
import {addMHWSLayers, registerMHWSInteractions} from "./layers/MHWS.js";
import {addVEdgeLayers, registerVEdgeInteractions} from "./layers/VEdge.js";
import {addTransectLayers, registerTransectInteractions} from "./layers/Transects.js";
import {addFutureMHWSLayer, updateFutureMHWS, updateFutureMHWSStyle, setFutureMHWSVisibility} from "./layers/FutureMHWS.js";
import {addFutureUncertaintyLayer, updateFutureUncertainty, updateFutureUncertaintyStyle, setFutureUncertaintyVisibility,} from "./layers/FutureMHWSUncertainty.js";

// Generic layer utilities
import {setDatasetVisibility, applyLayerVisibility} from "./map/LayerFactory.js";

/* 
 * -------------------------------------------------------------------------- 
 * Application state 
 * -------------------------------------------------------------------------- 
 * Application state is stored independently so it can be reapplied 
 * after changes take place. Initiated here with default values, but updated by user interactions.
 * 
 * MDH, August 2026
 * -------------------------------------------------------------------------- 
 */

const CURRENT_YEAR = new Date().getFullYear();

/*
 * Create the map
 * --------------------------------------------------------------------------
 */

function createMap() {
  return new maplibregl.Map({
    container: MapConfig.container,
    style: Basemaps[MapConfig.basemap].style,
    center: MapConfig.centre,
    zoom: MapConfig.zoom,
  });
}


/*
 * Apply the current future shoreline state
 * --------------------------------------------------------------------------
 * Controls visibility and data for the future MHWS line and its uncertainty
 * polygon.
 */
function applyFutureState(map) {
  const futureState = getFutureState();
  const visible = futureState.scenario !== "None";

  setFutureMHWSVisibility(
    map,
    FUTURE_DATASETS[0],
    visible,
  );

  setFutureUncertaintyVisibility(
    map,
    FUTURE_UNCERTAINTY_DATASETS[0],
    visible,
  );

  if (!visible) {
    return;
  }

  const selectedFutureDataset =
    getFutureMHWSDataset(futureState);

  if (selectedFutureDataset) {
    updateFutureMHWS(
      map,
      FUTURE_DATASETS[0],
      selectedFutureDataset,
      futureState.year,
    );

    updateFutureMHWSStyle(
      map,
      FUTURE_DATASETS[0],
      futureState.scenario,
    );
  }

  const selectedUncertaintyDataset =
    getFutureUncertaintyDataset(futureState);

  if (selectedUncertaintyDataset) {
    updateFutureUncertainty(
      map,
      FUTURE_UNCERTAINTY_DATASETS[0],
      selectedUncertaintyDataset,
    );

    updateFutureUncertaintyStyle(
      map,
      FUTURE_UNCERTAINTY_DATASETS[0],
      futureState.scenario,
    );
  }
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

    const assetState = getAssetState();
    const marineState = getMarineState();
    const futureState = getFutureState();

    applyAssetVisibility(map, assetState);
    applyLayerVisibility(map, LAYER_GROUPS);
    setTideGaugeVisibility(map, marineState.tideGauges);
    
    addTideGaugeLayer(map, TIDE_GAUGE_DATASET);
    addFutureMHWSLayer(map, FUTURE_DATASETS[0], futureState.year);
    addFutureUncertaintyLayer(map, FUTURE_UNCERTAINTY_DATASETS[0]);
    applyFutureState(map);
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