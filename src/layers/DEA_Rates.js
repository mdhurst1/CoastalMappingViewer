/* Scotland DEA Coastlines: first 5 km national rate layer and popup.
 * Place in src/layers/DEARates.js.
 * Requires plotly.js-dist-min (already used elsewhere in CMV).
 */
import Plotly from "plotly.js-dist-min";

const SOURCE_ID = "dea-rates-5000m-source";
const LAYER_ID = "dea-rates-5000m";
const PERIODS = ["1988_2025", "2000_2025", "2015_2025"];

const value = (v) =>
  v === null || v === undefined || v === "" ? null : Number(v);

const fmt = (v, decimals = 2) => {
  const n = value(v);
  return n === null || !Number.isFinite(n) ? "—" : n.toFixed(decimals);
};

const pValue = (v) => {
  const p = value(v);
  if (p === null || !Number.isFinite(p)) return "—";
  return p < 0.001 ? "<0.001" : p.toFixed(3);
};

export function addDEARateLayer(map) {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: `${import.meta.env.BASE_URL}data/Scotland_rates_5000m.geojson`,
      generateId: true,
    });
  }

  if (!map.getLayer(LAYER_ID)) {
    map.addLayer({
      id: LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 2, 7, 4, 11, 6],
        // Preliminary convention: negative is retreat, positive is advance.
        "circle-color": [
          "case",
          ["!", ["has", "rate_1988_2025"]], "#999999",
          ["interpolate", ["linear"], ["to-number", ["get", "rate_1988_2025"], 0],
            -2, "#b2182b", -0.5, "#ef8a62", 0, "#f7f7f7",
            0.5, "#67a9cf", 2, "#2166ac"],
        ],
        "circle-stroke-color": "#253347",
        "circle-stroke-width": 0.5,
        "circle-opacity": 0.88,
      },
    });
  }
}

function makeSummary(props) {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "width:380px;max-width:100%;font-family:Inter,Arial,sans-serif;color:#203044";

  const title = document.createElement("h3");
  title.style.cssText = "margin:0 0 4px;font-size:16px";
  title.textContent = `DEA MSL · 5 km hotspot ${props.hotspot_id ?? ""}`;
  wrapper.append(title);

  const info = document.createElement("div");
  info.style.cssText = "font-size:12px;color:#667085;margin-bottom:8px";
  info.textContent = `${props.aggregation ?? "Aggregated shoreline positions"} · ${props.n_source_points ?? "?"} source points`;
  wrapper.append(info);

  const stats = document.createElement("table");
  stats.style.cssText = "width:100%;font-size:12px;border-collapse:collapse;line-height:1.7";
  const header = document.createElement("tr");
  for (const label of ["Period", "Rate (m/yr)", "SE", "p"]) {
    const th = document.createElement("th");
    th.textContent = label;
    th.style.cssText = "text-align:left;border-bottom:1px solid #d0d5dd;padding:2px 4px";
    header.append(th);
  }
  stats.append(header);
  for (const period of PERIODS) {
    const tr = document.createElement("tr");
    for (const item of [
      period.replace("_", "–"),
      fmt(props[`rate_${period}`], 3),
      fmt(props[`se_${period}`], 3),
      pValue(props[`sig_${period}`]),
    ]) {
      const td = document.createElement("td");
      td.textContent = item;
      td.style.cssText = "padding:2px 4px;border-bottom:1px solid #f2f4f7";
      tr.append(td);
    }
    stats.append(tr);
  }
  wrapper.append(stats);

  const plot = document.createElement("div");
  plot.style.cssText = "width:100%;height:245px;margin-top:8px";
  wrapper.append(plot);

  const note = document.createElement("div");
  note.style.cssText = "font-size:11px;color:#667085;line-height:1.3";
  note.textContent = `Annual shoreline position relative to the ${props.baseline_year ?? 2024} baseline (m). Rates are supplied by DEA, not recalculated in CMV.`;
  wrapper.append(note);

  return { wrapper, plot };
}

export function registerDEARateInteractions(map, PopupClass) {
  let currentPopup = null;
  map.on("mouseenter", LAYER_ID, () => { map.getCanvas().style.cursor = "pointer"; });
  map.on("mouseleave", LAYER_ID, () => { map.getCanvas().style.cursor = ""; });

  map.on("click", LAYER_ID, (event) => {
    const feature = event.features?.[0];
    if (!feature) return;
    currentPopup?.remove();

    const props = feature.properties ?? {};
    const { wrapper, plot } = makeSummary(props);
    const popup = new PopupClass({ maxWidth: "440px", offset: 12 })
      .setLngLat(feature.geometry.coordinates)
      .setDOMContent(wrapper)
      .addTo(map);
    currentPopup = popup;

    const obs = Array.from({ length: 38 }, (_, i) => 1988 + i)
      .map((year) => ({ year, distance: value(props[`dist_${year}`]) }))
      .filter(({ distance }) => distance !== null && Number.isFinite(distance));

    if (!obs.length) {
      plot.textContent = "No annual shoreline positions available.";
    } else {
      Plotly.newPlot(plot, [{
        x: obs.map((d) => d.year),
        y: obs.map((d) => d.distance),
        type: "scatter",
        mode: "markers",
        name: "Annual MSL shoreline",
        marker: { color: "#277e9b", size: 6 },
        hovertemplate: "%{x}: %{y:.2f} m<extra></extra>",
      }], {
        height: 245,
        margin: { l: 50, r: 10, t: 10, b: 45 },
        font: { family: "Inter, Arial, sans-serif", size: 11 },
        xaxis: { title: { text: "Year" }, dtick: 10, showgrid: false },
        yaxis: { title: { text: "Position (m)" }, zeroline: true },
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#ffffff",
      }, { displayModeBar: false, responsive: true });
    }

    popup.on("close", () => {
      Plotly.purge(plot);
      if (currentPopup === popup) currentPopup = null;
    });
  });
}
