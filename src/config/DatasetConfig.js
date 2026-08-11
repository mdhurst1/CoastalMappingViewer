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


export const TIDE_GAUGE_DATASET = {
  id: "tide-gauges",
  name: "Tide gauges",
  file: `${import.meta.env.BASE_URL}/data/TideGauges.geojson`,
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
    id: "MHWS_Future",
  }
]

export const FUTURE_UNCERTAINTY_DATASETS = [
  {
    id: "MHWS_Future_Uncertainty",
  }
]


// get uncertainty file based on state attributes
export const FUTURE_SCENARIO_FILE_CODES = {
  RCP26: "RCP2",
  RCP45: "RCP4",
  RCP85: "RCP8",
};

export function getFutureMHWSDataset({ scenario, indicator }) {
  const scenarioCode =
    FUTURE_SCENARIO_FILE_CODES[scenario];

  if (!scenarioCode) {
    return null;
  }

  return {
    id: `${indicator}_Future`,
    file:
      `${import.meta.env.BASE_URL}/CMT_output/Future/` +
      `Montrose_Future_${scenarioCode}_P50.geojson`,
  };
}

export function getFutureUncertaintyDataset({scenario, indicator, year, }) {
  
  const scenarioCode =
    FUTURE_SCENARIO_FILE_CODES[scenario];

  if (!scenarioCode) {
    return null;
  }
  
  return {
    id: `${indicator}_Future_Uncertainty`,
    file: `${import.meta.env.BASE_URL}/CMT_output/Future/Montrose_Uncertainty_${scenarioCode}_${year}.geojson`,
  }
}

