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
import {getAssetState, getFutureState, getMarineState, getRasterState, updateAssetState, updateFutureState, updateMarineState, updateRasterState } from "./state/ApplicationState.js";
import { applyFutureState } from "./state/MapState.js";

// import map configurations
import { MapConfig } from "./config/MapConfig.js";
import { Basemaps } from "./config/BasemapConfig.js";
import { TIDE_GAUGE_DATASET, MHWS_DATASETS, VEDGE_DATASETS, TRANSECTS_DATASETS, FUTURE_DATASETS, FUTURE_UNCERTAINTY_DATASETS, FUTURE_SCENARIO_FILE_CODES, getFutureShorelineDataset, getFutureUncertaintyDataset} from "./config/DatasetConfig.js";

import { LEGEND_ITEMS } from "./config/LegendConfig.js";
import { LAYER_GROUPS } from "./config/LayerGroups.js";

// import control tools
import MapOptionsControl from "./controls/MapOptionsControl.js";
import LegendControl from "./controls/LegendControl.js";
import {addMapControls} from "./controls/MapControls.js";
import {getIntersectingTransects, summariseTransects,} from "./analysis/TransectsAnalysis.js";
import {createSelectionPopupContent, showSelectionPopup,} from "./popups/SelectionPopup.js";

// import layer tools
import {addAssetLayers, applyAssetVisibility} from "./layers/Assets.js";
import {addTideGaugeLayer,registerTideGaugeInteractions,setTideGaugeVisibility,} from "./layers/Marine.js";
import { addRasterLayers, applyRasterVisibility } from "./layers/Raster.js";
import {addMHWSLayers, registerMHWSInteractions} from "./layers/MHWS.js";
import {addVEdgeLayers, registerVEdgeInteractions} from "./layers/VEdge.js";
import {addTransectLayers, registerTransectInteractions} from "./layers/Transects.js";
import {addFutureShorelineLayer, updateFutureShoreline, updateFutureShorelineStyle, setFutureShorelineVisibility} from "./layers/FutureShorelines.js";
import {addFutureUncertaintyLayer, updateFutureUncertainty, updateFutureUncertaintyStyle, setFutureUncertaintyVisibility,} from "./layers/FutureShorelinesUncertainty.js";

// Generic layer utilities
import {setDatasetVisibility, applyLayerVisibility} from "./map/LayerFactory.js";

/*
 * Loading screen
 * --------------------------------------------------------------------------
 */

const hideLoadingScreen = () => {
  setTimeout(() => {
    const loadingScreen =
      document.getElementById("loading-screen");

    loadingScreen?.classList.add("loading-hidden");

    setTimeout(() => {
      loadingScreen?.remove();
    }, 500);
  }, 3000);
};

hideLoadingScreen();

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
    addRasterLayers(map);
    applyRasterVisibility(map, getRasterState());

    addFutureShorelineLayer(map, FUTURE_DATASETS[0], futureState.year);
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

  addMapControls(map, (polygon) => handleSelectionPolygon(map, polygon),);
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

function handleSelectionPolygon(
  map,
  polygon,
) {

  const transects =
    getIntersectingTransects(
      map,
      polygon,
      TRANSECTS_DATASETS,
    );

  const summary =
    summariseTransects(
      transects,
      "MHWS",
      "TWR",
    );

  showSelectionPopup(
    map,
    polygon,
    summary,
    maplibregl.Popup,
  );
}
/*
 * Start the application
 * --------------------------------------------------------------------------
 */

const map = initialiseApplication();