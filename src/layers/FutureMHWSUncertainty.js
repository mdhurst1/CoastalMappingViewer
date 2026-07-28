/*
 * Future shoreline uncertainty layer
 * --------------------------------------------------------------------------
 * Displays the uncertainty polygon associated with the selected emissions
 * scenario and prediction year.
 */

const SOURCE_SUFFIX = "-source";
const FILL_SUFFIX = "-fill";
const OUTLINE_SUFFIX = "-outline";

/**
 * Add the future uncertainty source and polygon layers.
 *
 * @param {maplibregl.Map} map
 * @param {Object} dataset
 */
export function addFutureUncertaintyLayer(map, dataset) {
  const sourceId = `${dataset.id}${SOURCE_SUFFIX}`;
  const fillLayerId = `${dataset.id}${FILL_SUFFIX}`;
  const outlineLayerId = `${dataset.id}${OUTLINE_SUFFIX}`;

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: "geojson",
      data: dataset.file,
    });
  }

  if (!map.getLayer(fillLayerId)) {
    map.addLayer({
      id: fillLayerId,
      type: "fill",
      source: sourceId,

      paint: {
        "fill-color": "#d73027",
        "fill-opacity": 0.2,
      },
    });
  }

  if (!map.getLayer(outlineLayerId)) {
    map.addLayer({
      id: outlineLayerId,
      type: "line",
      source: sourceId,

      paint: {
        "line-color": "#d73027",
        "line-width": 1,
        "line-opacity": 0.7,
      },
    });
  }
}

/**
 * Replace the uncertainty GeoJSON displayed by the source.
 *
 * @param {maplibregl.Map} map
 * @param {Object} dataset
 */
export function updateFutureUncertainty(map, dataset) {
  const sourceId = `${dataset.id}${SOURCE_SUFFIX}`;
  const source = map.getSource(sourceId);

  if (!source) {
    console.warn(
      `Cannot update ${dataset.id}: source has not been added.`,
    );
    return;
  }

  source.setData(dataset.file);
}

/**
 * Set uncertainty polygon visibility.
 *
 * @param {maplibregl.Map} map
 * @param {Object} dataset
 * @param {boolean} visible
 */
export function setFutureUncertaintyVisibility(
  map,
  dataset,
  visible,
) {
  const visibility = visible ? "visible" : "none";

  [
    `${dataset.id}${FILL_SUFFIX}`,
    `${dataset.id}${OUTLINE_SUFFIX}`,
  ].forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(
        layerId,
        "visibility",
        visibility,
      );
    }
  });
}

export function showFutureMHWSUncertainty(map, dataset) {
    map.setLayoutProperty(`${dataset.id}-line`, "visibility", "visible");
}

export function hideFutureMHWSUncertainty(map, dataset) {
    map.setLayoutProperty(`${dataset.id}-line`, "visibility", "none");
}