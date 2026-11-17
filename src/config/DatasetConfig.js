// config/datasets.js
// 
/* --------------------------------------------------------------------------
 * Dataset definitions
 * --------------------------------------------------------------------------
 * Defines the datasets available to the application.
 *
 * Each dataset entry
 * Declare datasets that will be plotted here
 * 
 * MDH, August 2026
 * --------------------------------------------------------------------------
 */
// MHWS datasets
export const MHWS_DATASETS = [
  {
    id: "MHWS 1890",
    file: `${import.meta.env.BASE_URL}/data/montrose_MHWS_1890.geojson`,
  },
  {
    id: "MHWS 1970",
    file: `${import.meta.env.BASE_URL}/data/montrose_MHWS_1970.geojson`,
  },
  {
    id: "MHWS LiDAR",
    file: `${import.meta.env.BASE_URL}/data/montrose_MHWS_Modern_LiDAR.geojson`,
  }
];

// Scotland-wide DEA MSL change rates. One resolution is drawn at a time.
// Zoom thresholds match the minzoom of the PMTiles produced by
// build_dea_pmtiles.sh. The final 300 m tiles overzoom past zoom 13 until
// the 30 m archive can be hosted separately.
export const DEA_RATE_DATASETS = [
  {
    id: "dea-rates-5000m",
    file: `${import.meta.env.BASE_URL}data/DEA_Scotland/Scotland_rates_5000m.geojson`,
    type: "geojson",
    spacing_m: 5000,
    minZoom: 0,
    maxZoom: 8,
  },
  {
    id: "dea-rates-1000m",
    file: `${import.meta.env.BASE_URL}data/DEA_Scotland/Scotland_rates_1000m.pmtiles`,
    type: "pmtiles",
    sourceLayer: "rates_1000m",
    spacing_m: 1000,
    minZoom: 8,
    maxZoom: 11,
  },
  {
    id: "dea-rates-300m",
    file: `${import.meta.env.BASE_URL}data/DEA_Scotland/Scotland_rates_300m.pmtiles`,
    type: "pmtiles",
    sourceLayer: "rates_300m",
    spacing_m: 300,
    minZoom: 11,
    maxZoom: 24,
  },
];

export const MSL_DATASETS = [
  {
    id: "DEA-MSL-Montrose",
    file: `${import.meta.env.BASE_URL}/data/montrose_DEA_MSL_annual_shorelines_1988_2025.geojson`,
  },
];

export const TIDE_GAUGE_DATASET = {
  id: "tide-gauges",
  name: "Tide gauges",
  file: `${import.meta.env.BASE_URL}/data/TideGauges.geojson`,
};

export const EXEMPLAR_SITES_DATASET = {
  id: "exemplar-sites",
  name: "Exemplar locations",
  file: `${import.meta.env.BASE_URL}/data/UKRI_Policy_Fellowship_Exemplar_Sites.geojson`,
};

export const VEDGE_DATASETS = [
  {
    id: "VEdge Combined",
    file: `${import.meta.env.BASE_URL}/data/Montrose_VEdge_combined.geojson`,
  }
]

export const TRANSECTS_DATASETS = [
  {
    id: "Transects",
    file: `${import.meta.env.BASE_URL}/CMT_output/Montrose_Transects.geojson`,
  }
]

export const FUTURE_DATASETS = [
  {
    id: "Future_Shoreline",
  }
];

export const FUTURE_UNCERTAINTY_DATASETS = [
  {
    id: "Future_Uncertainty",
  }
];

// get uncertainty file based on state attributes
export const FUTURE_SCENARIO_FILE_CODES = {
  RCP26: "RCP2",
  RCP45: "RCP4",
  RCP85: "RCP8",
};

// function to retrieve the future shoreline dataset based on scenario and indicator
export function getFutureShorelineDataset({
  scenario,
  indicator,
}) {

  const scenarioCode =
    FUTURE_SCENARIO_FILE_CODES[scenario];

  if (!scenarioCode) {
    return null;
  }

  return {
    id: "Future_Shoreline",
    file:
      `${import.meta.env.BASE_URL}/CMT_output/Future/` +
      `Montrose_Future_${indicator}_${scenarioCode}_P50.geojson`,
  };
}

// function to retrieve the future uncertainty dataset based on scenario, indicator, and year
export function getFutureUncertaintyDataset({
  scenario,
  indicator,
  year,
}) {

  const scenarioCode =
    FUTURE_SCENARIO_FILE_CODES[scenario];

  if (!scenarioCode) {
    return null;
  }

  return {
    id: "Future_Uncertainty",
    file:
      `${import.meta.env.BASE_URL}/CMT_output/Future/` +
      `Montrose_${indicator}_Uncertainty_${scenarioCode}_${year}.geojson`,
  };
}
