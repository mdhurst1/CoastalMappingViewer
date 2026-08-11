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

function getTimeseries(feature) {
  const rawTimeseries =
    feature.properties?.Timeseries;

  if (!rawTimeseries) {
    return {};
  }

  if (typeof rawTimeseries === "object") {
    return rawTimeseries;
  }

  try {
    return JSON.parse(rawTimeseries);
  }
  catch {
    return {};
  }
}


export function summariseTransects(
  transects,
  signalName = "MHWS",
  methodName = "TWR",
) {

  const rates = transects
    .map((transect) => {

      const timeseries =
        getTimeseries(transect);

      return -Number(
        timeseries
            ?.[signalName]
            ?.Results
            ?.[methodName]
            ?.Rate,
        );
    })
    .filter(Number.isFinite);

  if (rates.length === 0) {
    return {
      count: transects.length,
      rateCount: 0,
    };
  }

  const sortedRates =
    [...rates].sort((a, b) => a - b);

  const middle =
    Math.floor(sortedRates.length / 2);

  const median =
    sortedRates.length % 2 === 0
      ? (
          sortedRates[middle - 1] +
          sortedRates[middle]
        ) / 2
      : sortedRates[middle];

  return {
    count: transects.length,
    rateCount: rates.length,

    mean:
      rates.reduce(
        (sum, value) => sum + value,
        0,
      ) / rates.length,

    median,

    min: Math.min(...rates),
    max: Math.max(...rates),

    eroding:
      rates.filter(
        rate => rate < 0,
      ).length,

    accreting:
      rates.filter(
        rate => rate > 0,
      ).length,
  };
}