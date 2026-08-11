/*
 * Transect analysis
 * --------------------------------------------------------------------------
 * Spatial selection and summary analysis of coastal transects.
 */

import booleanIntersects from "@turf/boolean-intersects";

import { getLayerIds } from "../map/LayerFactory.js";


export function getIntersectingTransects(
  map,
  polygon,
  datasets,
) {
  const selected = [];

  datasets.forEach((dataset) => {
    const { sourceId } = getLayerIds(dataset);

    const features =
      map.querySourceFeatures(sourceId);

    features.forEach((feature) => {
      if (booleanIntersects(feature, polygon)) {
        selected.push(feature);
      }
    });
  });

  return selected;
}