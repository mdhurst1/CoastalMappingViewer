/*
 * MHWSLayer
 * --------------------------------------------------------------------------
 * Functions for displaying and interacting with Mean High Water Springs
 * shoreline data.
 */

/*
 * Create the MapLibre paint definition used for MHWS lines.
 */

// import style sheet for MHWS
import "./MHWS.css";

// set up hovering
let hoveredFeature = null;

export function getMHWSPaint(colours, fallbackYear) {
  const colourExpression = [
    "interpolate",
    ["linear"],
    [
      "to-number",
      ["slice", ["to-string", ["get", "Date"]], 0, 4],
      fallbackYear,
    ],
  ];

  colours.forEach(([year, colour]) => {
    colourExpression.push(year, colour);
  });

  return {
    "line-color": colourExpression,

    "line-width": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        5,
        2
    ],

    "line-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1.0,
        0.8
    ]
  };
}


/*
 * Add all MHWS GeoJSON sources and line layers.
 */
export function addMHWSLayers(map, datasets, colours, fallbackYear) {
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

        paint: getMHWSPaint(colours, fallbackYear),
      });
    }
  });
}


/*
 * Create popup content using DOM elements rather than an HTML string.
 *
 * Using textContent prevents property values from being interpreted as HTML.
 */
function createMHWSPopupContent(properties) {
  const container = document.createElement("div");
  container.className = "mhws-popup";

  const title = document.createElement("strong");
  title.textContent = "MHWS shoreline";

  const date = document.createElement("p");

  const dateLabel = document.createElement("strong");
  dateLabel.textContent = "Date: ";

  date.appendChild(dateLabel);
  date.append(properties.Date ?? "Unknown");

  const source = document.createElement("p");

  const sourceLabel = document.createElement("strong");
  sourceLabel.textContent = "Source: ";

  source.appendChild(sourceLabel);
  source.append(properties.Data_D ?? "Unknown");

  container.appendChild(title);
  container.appendChild(date);
  container.appendChild(source);

  return container;
}


/*
 * Register click and hover events for the MHWS layers.
 *
 * Call this function once when the application starts. Do not call it every
 * time the basemap style changes, or duplicate event handlers will accumulate.
 */
export function registerMHWSInteractions(map, datasets, PopupClass) {
  datasets.forEach((dataset) => {
    const layerId = `${dataset.id}-line`;

    map.on("mousemove", layerId, (event) => {
      const feature = event.features?.[0];

      if (!feature || feature.id === undefined) {
        return;
      }

      map.getCanvas().style.cursor = "pointer";

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
    });

    map.on("click", layerId, (event) => {
      const feature = event.features?.[0];

      if (!feature) {
        return;
      }

      const popupContent = createMHWSPopupContent(
        feature.properties ?? {},
      );

      new PopupClass()
        .setLngLat(event.lngLat)
        .setDOMContent(popupContent)
        .addTo(map);
    });
  });
}