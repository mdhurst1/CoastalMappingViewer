/*
 * Map controls
 * --------------------------------------------------------------------------
 * 
 * MDH, August 2026
 */

// import modulues
import maplibregl from "maplibre-gl";
import { MapConfig } from "../config/MapConfig.js";
import { Basemaps } from "../config/BasemapConfig.js";
import { LAYER_GROUPS } from "../config/LayerGroups.js";
import { LEGEND_ITEMS } from "../config/LegendConfig.js";
import { TIDE_GAUGE_DATASET, MHWS_DATASETS, VEDGE_DATASETS, TRANSECTS_DATASETS, FUTURE_DATASETS, FUTURE_UNCERTAINTY_DATASETS, FUTURE_SCENARIO_FILE_CODES, getFutureMHWSDataset, getFutureUncertaintyDataset} from "../config/DatasetConfig.js";

// import state management functions
import {getAssetState, getFutureState, getMarineState, updateAssetState, updateFutureState, updateMarineState } from "../state/ApplicationState.js";

import {DrawingControl,} from "./DrawingControl";
import MapOptionsControl from "./MapOptionsControl";
import LegendControl from "./LegendControl.js";

// import layer tools
import {addAssetLayers, applyAssetVisibility} from "../layers/Assets.js";
import {addTideGaugeLayer,registerTideGaugeInteractions,setTideGaugeVisibility,} from "../layers/Marine.js";
import {addMHWSLayers, registerMHWSInteractions} from "../layers/MHWS.js";
import {addVEdgeLayers, registerVEdgeInteractions} from "../layers/VEdge.js";
import {addTransectLayers, registerTransectInteractions} from "../layers/Transects.js";
import {addFutureMHWSLayer, updateFutureMHWS, updateFutureMHWSStyle, setFutureMHWSVisibility} from "../layers/FutureMHWS.js";
import {addFutureUncertaintyLayer, updateFutureUncertainty, updateFutureUncertaintyStyle, setFutureUncertaintyVisibility,} from "../layers/FutureMHWSUncertainty.js";

// Generic layer utilities
import {setDatasetVisibility, applyLayerVisibility} from "../map/LayerFactory.js";

// create a perspective control to toggle between 2D and 3D views
class PerspectiveControl {
  onAdd(map) {
    this.map = map;

    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl maplibregl-ctrl-group";

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = "perspective-control";
    this.button.title = "Toggle perspective view";
    this.button.setAttribute(
      "aria-label",
      "Toggle perspective view",
    );

    this.button.textContent = "3D";

    this.handleClick = () => {
      const isCurrentlyTilted = this.map.getPitch() > 5;

      this.map.easeTo({
        pitch: isCurrentlyTilted ? 0 : 60,
        bearing: isCurrentlyTilted
          ? 0
          : this.map.getBearing(),
        duration: 700,
      });
    };

    this.button.addEventListener(
      "click",
      this.handleClick,
    );

    this.container.appendChild(this.button);

    return this.container;
  }

  onRemove() {
    this.button.removeEventListener(
      "click",
      this.handleClick,
    );

    this.container.remove();
    this.map = undefined;
  }
}

export function addMapControls(map) {
  
  // first add the map control buttons using maplibres built in controls
  map.addControl(
    new maplibregl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true,
    }),
    "top-right",
  );

  // add the custom perspective control to the map
  map.addControl(
    new PerspectiveControl(),
    "top-right",
  );

  // add the custom drawing control to the map
  map.addControl(
    new DrawingControl(),
    "top-right",
  );

  // add a scale bar to the map
  map.addControl(
    new maplibregl.ScaleControl({
      maxWidth: 150,
      unit: "metric",
    }),
    "bottom-left",
  );

  // create handlers for the map options control
  // assets
  const handleAssetVisibilityChanged = (changes) => {
    const assetState = updateAssetState(changes);
    applyAssetVisibility(map, assetState);
  };
  // marine
  const handleMarineVisibilityChanged = (changes) => {
    const marineState = updateMarineState(changes);
    setTideGaugeVisibility(map,marineState.tideGauges);
  };

  // coastal layers
  const handleCoastalLayerVisibilityChanged = () => {
    applyLayerVisibility(map, LAYER_GROUPS);
    legendControl.updateVisibility(LAYER_GROUPS);
  };

  // future coast
  const handleFutureShorelineChanged = (changes) => {
    const futureState = updateFutureState(changes);
    applyFutureState(map);
    legendControl.updateFuture(futureState);
  };

  // enable the map options control and add it to the map
  const mapOptionsControl = new MapOptionsControl(
    Basemaps,
    MapConfig.basemap,
    LAYER_GROUPS,
    getAssetState(),
    getMarineState(),
    getFutureState(),
    handleAssetVisibilityChanged,
    handleMarineVisibilityChanged,
    handleCoastalLayerVisibilityChanged,
    handleFutureShorelineChanged,
  );

  map.addControl(
    mapOptionsControl,
    "top-left",
  );

  // create the legend control and add it to the map
  const legendControl = new LegendControl(LEGEND_ITEMS);

  map.addControl(
    legendControl,
    "bottom-right",
  );

  // Apply the initial legend state
  legendControl.updateVisibility(LAYER_GROUPS);
  legendControl.updateFuture(getFutureState());
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

