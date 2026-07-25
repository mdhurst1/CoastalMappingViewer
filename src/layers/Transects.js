/*
 * Transects Layer
 * --------------------------------------------------------------------------
 * Functions for displaying and interacting with Transects
 * 
 */

/*
 * Create the MapLibre paint definition used for Transects lines.
 */

// import style sheet for Transect
import "./Transects.css";

// set up hovering
let hoveredFeature = null;

export function getTransectPaint() {
  const MinRate = -5.0;
  const MaxRate = 5.0;

  return {
    "line-color": [
      "interpolate",
      ["linear"],
      ["to-number", ["get", "Hist_Rate"], 0],

      MIN_RATE, "#b2182b",
     -2.5, "#ef8a62",
      0.0, "#f7f7f7",
      2.5, "#67a9cf",
      MAX_RATE, "#2166ac",
    ],

    "line-width": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      5,
      2,
    ],

    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      1.0,
      0.8,
    ],
  };
}


/*
 * Add all Transect GeoJSON sources and line layers.
 */
export function addTransectLayers(map, datasets, colours, fallbackYear) {
  datasets.forEach((dataset) => {
    const sourceId = `${dataset.id}-source`;
    const haloLayerId = `${dataset.id}-halo`;
    const layerId = `${dataset.id}-line`;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: dataset.file,
        generateId: true,
      });
    }

    if (!map.getLayer(haloLayerId)) {
      map.addLayer({
        id: haloLayerId,
        type: "line",
        source: sourceId,

        layout: {
          "line-cap": "round",
          "line-join": "round",
        },

        paint: {
          "line-color": "#ffffff",

          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            7,
            0,
          ],

          "line-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0,
          ],
        },
      });
    }

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,

        layout: {
          "line-cap": "round",
          "line-join": "round",
        },

        paint: getTransectPaint(colours, fallbackYear),
      });
    }
  });
}


/*
 * Create popup content using DOM elements rather than an HTML string.
 *
 * Using textContent prevents property values from being interpreted as HTML.
 */
function createTransectPopupContent(properties) {
  const container = document.createElement("div");
  container.className = "Transect-popup";

  const title = document.createElement("strong");
  title.textContent = "Transect";

  const ID = document.createElement("p");

  const IDLabel = document.createElement("strong");
  IDLabel.textContent = "Transect ID: ";

  ID.appendChild(IDLabel);
  ID.append(properties.TransectID ?? "Unknown");

  const HistRate = document.createElement("p");

  const HistRateLabel = document.createElement("strong");
  HistRateLabel.textContent = "Historic Rate of Change (m/y): ";

  HistRate.appendChild(HistRateLabel);
  HistRate.append(properties.Hist_Rate ?? "Unknown");

  container.appendChild(title);
  container.appendChild(ID);
  container.appendChild(HistRate);

  return container;
}


/*
 * Register click and hover events for the Transect layers.
 *
 * Call this function once when the application starts. Do not call it every
 * time the basemap style changes, or duplicate event handlers will accumulate.
 */
export function registerTransectInteractions(map, datasets, PopupClass) {
  datasets.forEach((dataset) => {
    const layerId = `${dataset.id}-line`;

    map.on("mousemove", layerId, (event) => {
      const feature = event.features?.[0];

      if (!feature || feature.id === undefined) {
        return;
      }

      map.getCanvas().style.cursor = "crosshair";

      const nextHoveredFeature = {
        source: feature.source,
        id: feature.id,
      };

      // Do nothing if the cursor is still over the same feature
      if (
        hoveredFeature?.source === nextHoveredFeature.source &&
        hoveredFeature?.id === nextHoveredFeature.id
      ) {
        return;
      }

      // Remove highlighting from the previous feature
      if (hoveredFeature) {
        map.setFeatureState(hoveredFeature, {
          hover: false,
        });
      }

      // Highlight the new feature
      hoveredFeature = nextHoveredFeature;

      map.setFeatureState(hoveredFeature, {
        hover: true,
      });
    });

    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "move";
    });

    map.on("click", layerId, (event) => {
      const feature = event.features?.[0];

      if (!feature) {
        return;
      }

      const popupContent = createTransectPopupContent(
        feature.properties ?? {},
      );

      new PopupClass()
        .setLngLat(event.lngLat)
        .setDOMContent(popupContent)
        .addTo(map);
    });
  });
}