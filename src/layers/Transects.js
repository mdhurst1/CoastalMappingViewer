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
let selectedFeature = null;

export function getTransectPaint() {
  const MIN_RATE = -5.0;
  const MAX_RATE = 5.0;

  // define conditions to highlight
  const highlighted = [
    "any",
    ["boolean", ["feature-state", "hover"], false],
    ["boolean", ["feature-state", "selected"], false],
  ];

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
      highlighted,
      5,
      2,
    ],

    "line-opacity": [
      "case",
      highlighted,
      1,
      0.8,
    ],
  };
}


/*
 * Add all Transect GeoJSON sources and line layers.
 */
export function addTransectLayers(map, datasets) {
  
  const highlighted = [
    "any",
    ["boolean", ["feature-state", "hover"], false],
    ["boolean", ["feature-state", "selected"], false],
  ];
  
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

        paint: getTransectPaint(),
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

        paint: getTransectPaint(),
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
  // create popup container
  const container = document.createElement("div");
  container.className = "Transect-popup";

  // add transect ID as title
  const title = document.createElement("strong");
  title.textContent = "Transect ID: ";
  title.append(properties.TransectID ?? "Unknown");
  
  // add the erosion/accretion rate
  const HistRate = document.createElement("div");
  const HistRateLabel = document.createElement("strong");
  HistRateLabel.textContent = "Historic Rate: ";
  HistRate.appendChild(HistRateLabel);

  const rate = Number(properties.Hist_Rate);
  HistRate.append(
    Number.isFinite(rate)
    ? rate.toFixed(2)
    : "Unknown"
  );

  HistRate.append(" m/yr");


  container.appendChild(title);
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
      map.getCanvas().style.cursor = "";

      if (hoveredFeature) {
        map.setFeatureState(hoveredFeature, {
          hover: false,
        });

        hoveredFeature = null;
      }
    });

    map.on("click", layerId, (event) => {
      const feature = event.features?.[0];

      if (!feature || feature.id == null) {
        return;
      }

      // Clear the previously selected transect
      if (selectedFeature) {
        map.setFeatureState(
          selectedFeature,
          { selected: false },
        );
      }

      // Select the clicked transect
      selectedFeature = {
        source: feature.source,
        id: feature.id,
      };

      map.setFeatureState(
        selectedFeature,
        { selected: true },
      );

      const popupContent = createTransectPopupContent(
        feature.properties ?? {},
      );

      const popup = new PopupClass()
        .setLngLat(event.lngLat)
        .setDOMContent(popupContent)
        .addTo(map);

      // Remove the persistent highlight when the popup closes
      popup.on("close", () => {
        if (selectedFeature) {
          map.setFeatureState(
            selectedFeature,
            { selected: false },
          );

          selectedFeature = null;
        }
      });
    });
  });
}