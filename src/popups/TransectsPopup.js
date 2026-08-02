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

const RESULT_METHODS = [
  "TWR",
  "OLS",
  "EPR",
  "TheilSen",
];


function formatResultValue(value, decimals = 2) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number.toFixed(decimals)
    : "—";
}


function createTransectResults(timeseries) {
  const container = document.createElement("div");
  container.className = "transect-results";

  const signals = [
    {
      signal: timeseries.MHWS,
      heading: "MHWS results",
    },
    {
      signal: timeseries.VEdge,
      heading: "Vegetation edge results",
    },
  ];

  signals.forEach(({signal, heading}) => {
    const results = signal?.Results ?? {};

    const availableMethods = RESULT_METHODS.filter(
      method => results[method],
    );

    /*
     * Do not create a section when this signal has no results.
     */
    if (availableMethods.length === 0) {
      return;
    }

    const section = document.createElement("section");
    section.className = "transect-results-section";

    const title = document.createElement("h3");
    title.className = "transect-results-heading";
    title.textContent = heading;

    section.appendChild(title);

    const table = document.createElement("table");
    table.className = "transect-results-table";

    const tableHead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    [
      "Method",
      "Rate",
      "Uncertainty",
      "R²",
    ].forEach(label => {
      const cell = document.createElement("th");
      cell.textContent = label;
      headerRow.appendChild(cell);
    });

    tableHead.appendChild(headerRow);
    table.appendChild(tableHead);

    const tableBody = document.createElement("tbody");

    availableMethods.forEach(methodName => {
      const result = results[methodName];
      const row = document.createElement("tr");

      const methodCell = document.createElement("td");
      methodCell.textContent =
        result.Method ?? methodName;

      const rateCell = document.createElement("td");
      rateCell.textContent =
        `${formatResultValue(result.Rate)} m/yr`;

      const uncertaintyCell =
        document.createElement("td");

      if (result.RateUncertainty != null) {
        uncertaintyCell.textContent =
          `±${formatResultValue(
            result.RateUncertainty,
          )} m/yr`;
      } else if (result.RateCI95?.length === 2) {
        uncertaintyCell.textContent =
          `${formatResultValue(
            result.RateCI95[0],
          )} to ${formatResultValue(
            result.RateCI95[1],
          )} m/yr`;
      } else {
        uncertaintyCell.textContent = "—";
      }

      const r2Cell = document.createElement("td");
      r2Cell.textContent =
        formatResultValue(result.R2, 3);

      row.appendChild(methodCell);
      row.appendChild(rateCell);
      row.appendChild(uncertaintyCell);
      row.appendChild(r2Cell);

      tableBody.appendChild(row);
    });

    table.appendChild(tableBody);
    section.appendChild(table);
    container.appendChild(section);
  });

  /*
   * Show one message only when no signal has analytical results.
   */
  if (container.children.length === 0) {
    const message = document.createElement("p");
    message.className = "transect-results-empty";
    message.textContent =
      "No analytical results available.";

    container.appendChild(message);
  }

  return container;
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

  const timeseries = parseTimeseries(properties);

  const plot = document.createElement("div");
  plot.className = "transect-popup-plot";

  const results = createTransectResults(
    timeseries,
  );

  container.appendChild(plot);
  container.appendChild(results);

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