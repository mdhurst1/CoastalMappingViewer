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

function parseTopography(properties) {

  console.log("Transect properties:", properties);
  console.log("Raw topography:", properties?.Topography);
  
  const rawTopography = properties?.Topography;

  if (!rawTopography) {
    return {};
  }

  if (typeof rawTopography === "object") {
    return rawTopography;
  }

  try {
    return JSON.parse(rawTopography);
  } catch (error) {
    console.error(
      "TransectPopup: Could not parse Topography.",
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

function createRegressionTrace(
  signal,
  signalName,
  methodName,
) {
  const result = signal?.Results?.[methodName];
  const observations = signal?.Observations ?? [];
  const style = TimeseriesStyles[signalName];

  if (!result || !style) {
    return null;
  }

  /*
   * EPR is represented by the first and last observations rather than
   * a fitted value for every observation date.
   */
  if (methodName === "EPR") {
    if (
      result.StartDate == null ||
      result.EndDate == null ||
      result.StartValue == null ||
      result.EndValue == null
    ) {
      return null;
    }

    return {
      x: [
        result.StartDate,
        result.EndDate,
      ],

      y: [
        result.StartValue,
        result.EndValue,
      ],

      mode: "lines",

      name: `${style.label} ${methodName}`,

      line: {
        color: style.colour,
        width: 2,
        dash: "dash",
      },

      hovertemplate:
        `${style.label} ${methodName}` +
        "<br>%{x|%Y-%m-%d}" +
        "<br>%{y:.2f} m" +
        "<extra></extra>",
    };
  }

  /*
   * OLS, TWR and Theil-Sen results contain one fitted value for each
   * observation date.
   */
  const fitted = result.Fitted;

  if (
    !Array.isArray(fitted) ||
    fitted.length !== observations.length
  ) {
    return null;
  }

  return {
    x: observations.map(
      observation => observation.Date,
    ),

    y: fitted,

    mode: "lines",

    name: `${style.label} ${methodName}`,

    line: {
      color: style.colour,
      width: 2,
      dash: "dash",
    },

    hovertemplate:
      `${style.label} ${methodName}` +
      "<br>%{x|%Y-%m-%d}" +
      "<br>%{y:.2f} m" +
      "<extra></extra>",
  };
}

export function plotTransectTimeseries(plot, timeseries, selectedMethod) {
  const traces = [];

  if (timeseries.MHWS?.Observations?.length) {
    
    traces.push(createTimeseriesTrace(timeseries.MHWS, "MHWS"));
    const regressionTrace = createRegressionTrace(timeseries.MHWS, "MHWS", selectedMethod);
    if (regressionTrace) {
      traces.push(regressionTrace);
    }
  }

  if (timeseries.VEdge?.Observations?.length) {
    
    traces.push(createTimeseriesTrace(timeseries.VEdge, "VEdge"));
    const regressionTrace = createRegressionTrace(timeseries.VEdge, "VEdge", selectedMethod);

    if (regressionTrace) {
      traces.push(regressionTrace);
    }
  }
  
  if (traces.length === 0) {
    plot.textContent =
      "No shoreline time-series observations available.";

    return;
  }

  Plotly.react(plot, traces,
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

// Function to plot transect topography using Plotly
export function plotTransectTopography(plot, topography,) {

  // pull distance and elevation arrays from the topography object, defaulting to empty arrays if not present
  const distance = (topography?.Distance ?? []).map(value => -value,);
  const elevation = topography?.Elevation ?? [];

  // dont plot if theres no data
  if (distance.length === 0 || elevation.length === 0) {
    Plotly.purge(plot);
    plot.textContent = "No transect topography available.";
    return;
  }

  const minElevation = Math.min(...elevation);
  const maxElevation = Math.max(...elevation);
  const elevationRange = maxElevation - minElevation;
  const plotBottom = minElevation - elevationRange * 0.1;

  const fillTrace = {
    x: [
      ...distance,
      distance[distance.length - 1],
      distance[0],
    ],

    y: [
      ...elevation,
      plotBottom,
      plotBottom,
    ],

    fill: "toself",
    fillcolor: "rgba(180, 180, 180, 0.3)",

    line: {
      width: 0,
    },

    hoverinfo: "skip",
    showlegend: false,
  };

  const profileTrace = {
    x: distance,
    y: elevation,

    mode: "lines",

    line: {
      color: "#555",
      width: 2,
    },

    hovertemplate:
      "Distance: %{x:.1f} m" +
      "<br>Elevation: %{y:.2f} m" +
      "<extra></extra>",
  };

  Plotly.react(
    plot,
    [fillTrace, profileTrace],
    {
      height: 280,
      autosize: true,

      font: {
        family:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        size: 12,
        color: "#1f2937",
      },

      margin: {
        l: 85,
        r: 20,
        t: 20,
        b: 70,
        pad: 0,
      },

      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#ffffff",

      xaxis: {
        title: {
          text: "Distance along transect (m)",
          standoff: 12,
        },
        automargin: true,
        showgrid: false,
        showline: true,
        zeroline: false,
        fixedrange: false,
      },

      yaxis: {
        title: {
          text: "Elevation (m)",
          standoff: 12,
        },
        range: [
          plotBottom,
          maxElevation + elevationRange * 0.1,
        ],
        automargin: true,
        showgrid: false,
        showline: true,
        zeroline: false,
        fixedrange: false,
      },

      showlegend: false,
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


function createTransectResults(timeseries, selectedMethod) {
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

    const availableMethods = results[selectedMethod]
      ? [selectedMethod]
      : [];

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

// function to add a result selector for type of timeseries analysis
function createResultSelector(timeseries) {
  const wrapper = document.createElement("div");
  wrapper.className = "transect-result-selector";

  const label = document.createElement("label");
  label.textContent = "Analysis method";

  const select = document.createElement("select");

  /*
   * Only include methods that exist for at least one signal.
   */
  const availableMethods = RESULT_METHODS.filter(
    method =>
      timeseries.MHWS?.Results?.[method] ||
      timeseries.VEdge?.Results?.[method],
  );

  availableMethods.forEach(method => {
    const option = document.createElement("option");

    option.value = method;
    option.textContent =
      timeseries.MHWS?.Results?.[method]?.Method ??
      timeseries.VEdge?.Results?.[method]?.Method ??
      method;

    select.appendChild(option);
  });

  /*
 * Select TWR initially so its regression line and results are shown
 * as soon as the popup opens.
 */
  const preferredMethod = "TWR";

  if (availableMethods.includes(preferredMethod)) {
    select.value = preferredMethod;
  } else if (availableMethods.length > 0) {
    select.value = availableMethods[0];
  }

  label.appendChild(select);
  wrapper.appendChild(label);

  return {
    wrapper,
    select,
    availableMethods,
  };
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

  // selector for type of plot to display
  const plotSelectorContainer = document.createElement("div");
  plotSelectorContainer.className = "transect-result-selector";

  const plotSelectorLabel = document.createElement("label");
  plotSelectorLabel.textContent = "Plot";

  const plotSelector = document.createElement("select");

  const timeseriesOption = document.createElement("option");
  timeseriesOption.value = "timeseries";
  timeseriesOption.textContent = "Shoreline change";

  const topographyOption = document.createElement("option");
  topographyOption.value = "topography";
  topographyOption.textContent = "Topography";

  plotSelector.append(
    timeseriesOption,
    topographyOption,
  );

  plotSelectorLabel.appendChild(plotSelector);
  plotSelectorContainer.appendChild(plotSelectorLabel);

  container.appendChild(plotSelectorContainer);

  // then add the timeseries selector below the plot
  const timeseries = parseTimeseries(properties);
  const topography = parseTopography(properties);

  const {
    wrapper: selector,
    select,
    availableMethods,
  } = createResultSelector(timeseries);

  // create the plot container
  const plot = document.createElement("div");
  plot.className = "transect-popup-plot";

  const resultsContainer = document.createElement("div");
  resultsContainer.className =
    "transect-results-container";


  container.appendChild(plot);
  if (availableMethods.length > 0) {
    container.appendChild(selector);
  }
  container.appendChild(resultsContainer);

  const render = () => {

    const selectedPlot =
      plotSelector.value;

    const selectedMethod =
      select.value || null;

    if (selectedPlot === "topography") {

      plotTransectTopography(
        plot,
        topography,
      );

      // Analysis controls/results do not apply
      selector.style.display = "none";
      resultsContainer.style.display = "none";

    } else {

      plotTransectTimeseries(
        plot,
        timeseries,
        selectedMethod,
      );

      selector.style.display = "";
      resultsContainer.style.display = "";

      resultsContainer.replaceChildren(
        createTransectResults(
          timeseries,
          selectedMethod,
        ),
      );
    }
  };

  plotSelector.addEventListener(
    "change",
    render,
  );

  select.addEventListener(
    "change",
    render,
  );

  /*
   * Allow MapLibre to attach the popup element to the DOM before Plotly
   * measures and renders into it.
   */
  requestAnimationFrame(() => {
    render();
  });

  return container;
}