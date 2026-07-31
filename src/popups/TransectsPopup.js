/*
 * TransectPopup
 * --------------------------------------------------------------------------
 * Build popup content and time-series plots for coastal transects.
 */

import Plotly from "plotly.js-dist-min";

import {
  appendPopupField,
  createPopupContainer,
} from "./PopupContent.js";


function parseTimeseries(properties) {
  const rawTimeseries = properties?.Timeseries;

  if (!rawTimeseries) {
    return {};
  }

  if (typeof rawTimeseries === "object") {
    return rawTimeseries;
  }

  try {
    return JSON.parse(rawTimeseries);
  } catch (error) {
    console.error(
      "TransectPopup: Could not parse Timeseries.",
      error,
    );

    return {};
  }
}


function createTimeseriesTrace(signal, name) {
  const observations = signal?.Observations ?? [];

  return {
    x: observations.map(
      (observation) => observation.Date,
    ),

    y: observations.map(
      (observation) => observation.Distance,
    ),

    error_y: {
      type: "data",

      array: observations.map(
        (observation) => observation.Error ?? 0,
      ),

      visible: observations.some(
        (observation) => observation.Error != null,
      ),
    },

    mode: "lines+markers",
    name,
  };
}


export function plotTransectTimeseries(plot, timeseries) {
  const traces = [];

  if (timeseries.MHWS?.Observations?.length) {
    traces.push(
      createTimeseriesTrace(
        timeseries.MHWS,
        "MHWS",
      ),
    );
  }

  if (timeseries.VEdge?.Observations?.length) {
    traces.push(
      createTimeseriesTrace(
        timeseries.VEdge,
        "Vegetation edge",
      ),
    );
  }

  if (traces.length === 0) {
    plot.textContent =
      "No shoreline time-series observations available.";

    return;
  }

  Plotly.newPlot(
    plot,
    traces,
    {
      height: 280,

      margin: {
        l: 55,
        r: 15,
        t: 15,
        b: 45,
      },

      xaxis: {
        title: "Date",
        type: "date",
      },

      yaxis: {
        title: "Distance along transect (m)",
      },

      legend: {
        orientation: "h",
      },

      showlegend: traces.length > 1,
    },
    {
      responsive: true,
      displayModeBar: false,
    },
  );
}


export function createTransectPopupContent(properties) {
  const transectId =
    properties.TransectID ?? "Unknown";

  const container = createPopupContainer(
    "transect-popup",
    `Transect ID: ${transectId}`,
  );

  appendPopupField(
    container,
    "CMU",
    properties.CMU,
    {
      element: "div",
    },
  );

  appendPopupField(
    container,
    "Line",
    properties.LineID,
    {
      element: "div",
    },
  );

  const plot = document.createElement("div");
  plot.className = "transect-popup-plot";

  container.appendChild(plot);

  const timeseries = parseTimeseries(properties);

  /*
   * Allow MapLibre to attach the popup element to the DOM before Plotly
   * measures and renders into it.
   */
  requestAnimationFrame(() => {
    plotTransectTimeseries(
      plot,
      timeseries,
    );
  });

  return container;
}