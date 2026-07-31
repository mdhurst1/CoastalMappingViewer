/*
 * TransectPopup
 * --------------------------------------------------------------------------
 * Build popup content and time-series plots for coastal transects.
 */

import Plotly from "plotly.js-dist-min";
import { TimeseriesStyles } from "./TimeseriesStyles.js";

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
  const style = TimeseriesStyles[name];

  return {

    x: observations.map(
      observation => observation.Date,
    ),

    y: observations.map(
      observation => observation.Distance,
    ),

    error_y: {
      type: "data",
      array: observations.map(
        observation => observation.Error ?? 0,
      ),
      visible: observations.some(
        observation => observation.Error != null,
      ),
      color: style.colour,
    },

    mode: "markers",

    name: style.label,

    marker: {
      color: style.colour,
      symbol: style.symbol,
      size: 7,
    },

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
        "VEdge",
      ),
    );
  }

  if (traces.length === 0) {
    plot.textContent =
      "No shoreline time-series observations available.";

    return;
  }

  Plotly.newPlot(plot, traces,
    {
      // set up the plot area
      height: 280,
      autosize: true,

      // grab customised fonts
      font: {
        family: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        size: 12,
        color: "#1f2937",
      },

      // format plot area
      margin: {l: 85, r: 20, t: 20, b: 70, pad: 0},
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#ffffff",

      // format axes
      xaxis: {title: {text: "Date", standoff: 12,}, type: "date", automargin: true, showgrid: false, showline: true, fixedrange: false},
      yaxis: {title: {text: "Distance along transect (m)", standoff: 12}, automargin: true, showgrid: false, showline: true, zeroline: false, fixedrange: false},
      
      //add custom zero line to y-axis
      shapes: [{type: "line", xref: "paper", x0: 0, x1: 1, yref: "y", y0: 0, y1: 0,
                line: {color: "#999", width: 1, dash: "dot"}}], 


      legend: {orientation: "h", x: 0.02, y: 1.15, xanchor: "left", yanchor: "top", bgcolor: "rgba(255,255,255,0.9)", bordercolor: "#999", borderwidth: 1},
      showlegend: traces.length > 1,
      hovermode: "closest",
    },
    {
      responsive: true,
      displayModeBar: false,
      scrollZoom: true,
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