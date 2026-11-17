/*
 * DEA Coastlines Scotland — rate-point layers
 * --------------------------------------------------------------------------
 * MapLibre sources, styling and interaction registration only.
 * Popup DOM and Plotly rendering live in popups/DEARates_popup.js.
 */

import { DEA_RATE_COLOURS } from "./LayerStyles.js";
import { registerPointInteractions } from "../map/Interactions.js";
import {
  createDEARatePopupContent,
  plotDEARateTimeseries,
  purgeDEARateTimeseries,
} from "../popups/DEARates_popup.js";
import "../styles/Popup.css";

const rateColour = [
  "case",
  ["==", ["get", "rate_1988_2025"], null],
  "#999999",
  [
    "interpolate", ["linear"],
    ["to-number", ["get", "rate_1988_2025"]],
    ...DEA_RATE_COLOURS.flat(),
  ],
];

export function addDEARateLayers(map, datasets) {
  datasets.forEach((dataset) => {
    const sourceId = `${dataset.id}-source`;
    const layerId = `${dataset.id}-points`;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: dataset.file,
        generateId: true,
      });
    }

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        layout: { visibility: "none" },
        paint: {
          "circle-color": rateColour,
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            4, 2.5,
            8, 4.0,
            12, 5.5,
          ],
          "circle-opacity": 0.9,
          "circle-stroke-color": "#273747",
          "circle-stroke-width": 0.5,
        },
      });
    }
  });
}

export function registerDEARateInteractions(map, datasets, PopupClass) {
  datasets.forEach((dataset) => {
    registerPointInteractions(
      map,
      `${dataset.id}-points`,
      PopupClass,
      (properties) => createDEARatePopupContent(properties, dataset),
      {
        popupOptions: { maxWidth: "460px" },
        onOpen: (content, properties) => {
          plotDEARateTimeseries(content, properties);
        },
        onClose: (content) => {
          purgeDEARateTimeseries(content);
        },
      },
    );
  });
}
