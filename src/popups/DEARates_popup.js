/*
 * DEA Coastlines Scotland — rate-point popup
 * --------------------------------------------------------------------------
 * Separate DOM creation and Plotly time-series rendering, matching CMV's
 * existing layer/popup split. Data come directly from DEA rate-point fields.
 */

import Plotly from "plotly.js-dist-min";
import { createPopupContainer } from "./PopupContent.js";

const PERIODS = [
  ["1988_2025", "1988–2025"],
  ["2000_2025", "2000–2025"],
  ["2015_2025", "2015–2025"],
];

function numeric(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatNumber(value, decimals = 3) {
  const number = numeric(value);
  return number === null ? "—" : number.toFixed(decimals);
}

function formatP(value) {
  const p = numeric(value);
  if (p === null) return "—";
  return p < 0.001 ? "<0.001" : p.toFixed(3);
}

function addTextElement(parent, tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

export function createDEARatePopupContent(properties, dataset = {}) {
  const container = createPopupContainer(
    "dea-rate-popup",
    `DEA MSL shoreline change · ${dataset.spacing_m ? `${dataset.spacing_m / 1000} km` : "rate point"}`,
  );

  const rate = numeric(properties.rate_1988_2025);
  addTextElement(
    container, "div", "dea-rate-popup-headline",
    rate === null ? "Rate unavailable" : `${rate > 0 ? "+" : ""}${rate.toFixed(3)} m/yr`,
  );

  const description = properties.aggregation ?? "Annual shoreline position";
  const count = numeric(properties.n_source_points);
  const countText = count === null ? "" : ` · ${count.toLocaleString()} source points`;
  addTextElement(
    container, "p", "dea-rate-popup-details",
    `Hotspot ${properties.hotspot_id ?? "—"} · ${description}${countText}`,
  );

  addTextElement(container, "div", "dea-rate-popup-heading", "Annual shoreline position");
  const plot = document.createElement("div");
  plot.className = "dea-rate-popup-plot";
  container.appendChild(plot);

  addTextElement(container, "div", "dea-rate-popup-heading", "Change rates");
  const table = document.createElement("table");
  table.className = "dea-rate-popup-table";
  const thead = document.createElement("thead");
  const header = document.createElement("tr");
  for (const label of ["Period", "Rate (m/yr)", "SE", "p-value"]) {
    const th = document.createElement("th");
    th.textContent = label;
    th.scope = "col";
    header.appendChild(th);
  }
  thead.appendChild(header);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  PERIODS.forEach(([key, label]) => {
    const tr = document.createElement("tr");
    for (const text of [
      label,
      formatNumber(properties[`rate_${key}`]),
      formatNumber(properties[`se_${key}`]),
      formatP(properties[`sig_${key}`]),
    ]) {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);

  const baseline = properties.baseline_year ?? 2024;
  addTextElement(
    container, "p", "dea-rate-popup-footnote",
    `Distances are relative to the ${baseline} baseline (m). These are ${description.toLowerCase()}. Rates and p-values are supplied by the DEA dataset. Positive/negative direction should be checked against the extraction convention.`,
  );
  return container;
}

export function plotDEARateTimeseries(container, properties) {
  const plot = container.querySelector(".dea-rate-popup-plot");
  if (!plot) return;

  const observations = [];
  for (let year = 1988; year <= 2025; year += 1) {
    const distance = numeric(properties[`dist_${year}`]);
    if (distance !== null) observations.push({ year, distance });
  }

  if (!observations.length) {
    plot.textContent = "No annual shoreline observations available.";
    return;
  }

  Plotly.newPlot(
    plot,
    [{
      x: observations.map(({ year }) => year),
      y: observations.map(({ distance }) => distance),
      type: "scatter",
      mode: "markers+lines",
      name: "Annual MSL position",
      marker: { color: "#2b819f", size: 6 },
      line: { color: "rgba(43,129,159,0.45)", width: 1 },
      hovertemplate: "%{x}: %{y:.2f} m<extra></extra>",
    }],
    {
      height: 236,
      margin: { l: 53, r: 15, t: 10, b: 45 },
      font: { family: "Inter, Arial, sans-serif", size: 11, color: "#253347" },
      xaxis: { title: { text: "Year" }, dtick: 10, showgrid: false },
      yaxis: { title: { text: "Distance (m)" }, zeroline: true },
      showlegend: false,
      hovermode: "closest",
      paper_bgcolor: "#ffffff",
      plot_bgcolor: "#ffffff",
    },
    { responsive: true, displayModeBar: false },
  ).catch((error) => console.warn("DEA rate chart could not render", error));
}

export function purgeDEARateTimeseries(container) {
  const plot = container?.querySelector(".dea-rate-popup-plot");
  if (plot) Plotly.purge(plot);
}
