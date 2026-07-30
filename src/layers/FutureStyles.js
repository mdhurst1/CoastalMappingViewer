/*
 * Future shoreline styles
 * --------------------------------------------------------------------------
 * Centralised styling for future shoreline predictions and uncertainty.
 */

export const FUTURE_SCENARIO_STYLES = {
  RCP26: {
    label: "RCP 2.6",
    colour: "#2b83ba",

    shoreline: {
      width: 3,
      opacity: 0.95,
      dasharray: [3, 2],
    },

    uncertainty: {
      opacity: 0.15,
      outlineColour: "#2b83ba",
      outlineWidth: 0,
    },
  },

  RCP45: {
    label: "RCP 4.5",
    colour: "#fdae61",

    shoreline: {
      width: 3,
      opacity: 0.95,
      dasharray: [3, 2],
    },

    uncertainty: {
      opacity: 0.15,
      outlineColour: "#fdae61",
      outlineWidth: 0,
    },
  },

  RCP85: {
    label: "RCP 8.5",
    colour: "#d7191c",

    shoreline: {
      width: 3,
      opacity: 0.95,
      dasharray: [3, 2],
    },

    uncertainty: {
      opacity: 0.2,
      outlineColour: "#d7191c",
      outlineWidth: 0,
    },
  },
};

/**
 * Return the style associated with a scenario.
 *
 * @param {string} scenario
 * @returns {Object|null}
 */
export function getFutureScenarioStyle(scenario) {
  return FUTURE_SCENARIO_STYLES[scenario] ?? null;
}