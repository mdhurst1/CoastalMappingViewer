/*
 * Application state
 * --------------------------------------------------------------------------
 * Stores the current user-selected application settings.
 *
 * Keeping this state outside the controls and map initialisation code provides
 * a single source of truth that can be reapplied after any basemap style change.
 *
 * MDH, August 2026
 */

/*
 * Default state
 * --------------------------------------------------------------------------
 */

const DefaultFutureState = {scenario: "None", indicator: "MHWS", year: 2030};
const DefaultMarineState = {TideGauges: false};
const DefaultAssetState = {buildings: false, roads: false, railways: false};
const DefaultRasterState = {lidarDTM: false, AerialPhotography: false};

/*
 * Current state initially copied from defaults
 * --------------------------------------------------------------------------
 */

let futureState = { ...DefaultFutureState };
let assetState = { ...DefaultAssetState };
let marineState = { ...DefaultMarineState };
let rasterState = { ...DefaultRasterState };

/*
 * Future shoreline state
 * --------------------------------------------------------------------------
 */

/**
 * Return a copy of the current future shoreline state.
 *
 * Returning a copy prevents other modules from accidentally modifying the
 * stored state without using the update function.
 *
 * @returns {Object}
 */
export function getFutureState() {
  return { ...futureState };
}


/**
 * Update the future shoreline state.
 *
 * Only supplied properties are changed. This allows individual controls to
 * update one property without needing to reconstruct the complete state.
 *
 * @param {Object} changes - Future-state properties to update.
 * @returns {Object} A copy of the updated state.
 */
export function updateFutureState(changes) {
  futureState = {
    ...futureState,
    ...changes,
  };

  return getFutureState();
}


/*
 * Asset state
 * --------------------------------------------------------------------------
 */

/**
 * Return a copy of the current asset visibility state.
 *
 * @returns {Object}
 */
export function getAssetState() {
  return { ...assetState };
}


/**
 * Update the asset visibility state.
 *
 * @param {Object} changes - Asset-state properties to update.
 * @returns {Object} A copy of the updated state.
 */
export function updateAssetState(changes) {
  assetState = {
    ...assetState,
    ...changes,
  };

  return getAssetState();
}

/*
 * Marine layer state
 * --------------------------------------------------------------------------
 */

/**
 * Return a copy of the current marine-layer visibility state.
 *
 * @returns {Object}
 */
export function getMarineState() {
  return { ...marineState };
}


/**
 * Update the marine-layer visibility state.
 *
 * @param {Object} changes - Marine-state properties to update.
 * @returns {Object} A copy of the updated state.
 */
export function updateMarineState(changes) {
  marineState = {
    ...marineState,
    ...changes,
  };

  return getMarineState();
}

/*
 * Raster layer state
 * --------------------------------------------------------------------------
 */

/**
 * Return a copy of the current raster-layer visibility state.
 *
 * @returns {Object}
 */
export function getRasterState() {
  return { ...rasterState };
}


/**
 * Update the raster-layer visibility state.
 *
 * @param {Object} changes - Raster-state properties to update.
 * @returns {Object} A copy of the updated state.
 */
export function updateRasterState(changes) {
  rasterState = {
    ...rasterState,
    ...changes,
  };

  return getRasterState();
}