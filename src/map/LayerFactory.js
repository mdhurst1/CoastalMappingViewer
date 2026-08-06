/*
 * LineLayer
 * --------------------------------------------------------------------------
 * Shared helpers for adding GeoJSON line sources, display layers and optional
 * highlight halos to a MapLibre map.
 */

export const HIGHLIGHTED_EXPRESSION = [
  "any",
  ["boolean", ["feature-state", "hover"], false],
  ["boolean", ["feature-state", "selected"], false],
];

export function getLayerIds(dataset) {
  return {
    sourceId: `${dataset.id}-source`,
    haloLayerId: `${dataset.id}-halo`,
    lineLayerId: `${dataset.id}-line`,
  };
}

export function createHighlightHaloPaint({
  colour = "#ffffff",
  width = 9,
} = {}) {
  return {
    "line-color": colour,
    "line-width": ["case", HIGHLIGHTED_EXPRESSION, width, 0],
    "line-opacity": ["case", HIGHLIGHTED_EXPRESSION, 1, 0],
  };
}

export function addGeoJsonLineLayers(
  map,
  datasets,
  {
    paint,
    halo = {},
    layout = {
      "line-cap": "round",
      "line-join": "round",
    },
  },
) {
  datasets.forEach((dataset) => {
    const { sourceId, haloLayerId, lineLayerId } = getLayerIds(dataset);

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: dataset.file,
        generateId: true,
      });
    }

    if (halo.enabled !== false && !map.getLayer(haloLayerId)) {
      map.addLayer({
        id: haloLayerId,
        type: "line",
        source: sourceId,
        layout,
        paint: createHighlightHaloPaint(halo),
      });
    }

    if (!map.getLayer(lineLayerId)) {
      map.addLayer({
        id: lineLayerId,
        type: "line",
        source: sourceId,
        layout,
        paint: typeof paint === "function" ? paint(dataset) : paint,
      });
    }
  });
}

export function setDatasetVisibility(map, dataset, visible) {
  const { haloLayerId, lineLayerId } = getLayerIds(dataset);
  const visibility = visible ? "visible" : "none";

  [haloLayerId, lineLayerId].forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visibility);
    }
  });
}

export function applyLayerVisibility(map, layerGroups) {
  Object.values(layerGroups).forEach((group) => {
    group.datasets.forEach((dataset) => {
      setDatasetVisibility(
        map,
        dataset,
        group.visible,
      );
    });
  });
}