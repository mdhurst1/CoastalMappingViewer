/*
 * Future shoreline uncertainty layer
 * --------------------------------------------------------------------------
 * Displays the uncertainty polygon associated with the selected emissions
 * scenario and prediction year.
 */

const SOURCE_SUFFIX = "-source";
const FILL_SUFFIX = "-fill";
const OUTLINE_SUFFIX = "-outline";

const EMPTY_GEOJSON = {
  type: "FeatureCollection",
  features: [],
};

/**
 * Add the future uncertainty source and polygon layers.
 *
 * The source initially contains no features. Its data is replaced when the
 * user selects a future sea-level scenario.
 *
 * @param {maplibregl.Map} map
 * @param {Object} dataset
 */
export function addFutureUncertaintyLayer(
  map,
  dataset,
) {
  const sourceId = `${dataset.id}${SOURCE_SUFFIX}`;
  const fillLayerId = `${dataset.id}${FILL_SUFFIX}`;
  const outlineLayerId =
    `${dataset.id}${OUTLINE_SUFFIX}`;

  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: "geojson",
      data: EMPTY_GEOJSON,
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
 * Replace the GeoJSON displayed by the uncertainty source.
 *
 * @param {maplibregl.Map} map
 * @param {Object} layerDataset
 * @param {Object} selectedDataset
 */
export function updateFutureUncertainty(
  map,
  layerDataset,
  selectedDataset,
) {
  const sourceId =
    `${layerDataset.id}${SOURCE_SUFFIX}`;

  const source = map.getSource(sourceId);

  if (!source) {
    console.warn(
      `Cannot update ${layerDataset.id}: ` +
      "source has not been added.",
    );

    return;
  }

  source.setData(selectedDataset.file);
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

  const layerIds = [
    `${dataset.id}${FILL_SUFFIX}`,
    `${dataset.id}${OUTLINE_SUFFIX}`,
  ];

  layerIds.forEach((layerId) => {
    if (!map.getLayer(layerId)) {
      return;
    }

    map.setLayoutProperty(
      layerId,
      "visibility",
      visibility,
    );
  });
}