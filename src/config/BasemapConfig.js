// config/basemaps.js

/*
 * Basemap definitions
 * --------------------------------------------------------------------------
 * Defines the basemap styles available to the application.
 *
 * Each basemap entry contains:
 *
 * name
 *     Human-readable name displayed in the basemap control.
 *
 * style
 *     Either:
 *
 *     1. A URL pointing to a MapLibre style document; or
 *     2. An inline MapLibre style object.
 *
 * OpenFreeMap provides complete hosted vector styles.
 *
 * Esri World Imagery is configured here as an inline MapLibre style using
 * Esri raster tiles. Attribution is included in the raster source and is
 * displayed by MapLibre's attribution control.
 *
 * Changing basemap calls map.setStyle(), which replaces all sources and
 * layers in the current style. Application-specific layers must therefore
 * be re-added when the new style emits the "style.load" event.
 * 
 * MDH August 2026
 */

export const Basemaps = {
  Positron: {
    name: "Light",
    style: "https://tiles.openfreemap.org/styles/positron",
  },

  Dark: {
    name: "Dark",
    style: "https://tiles.openfreemap.org/styles/dark",
  },

  Bright: {
    name: "Street map",
    style: "https://tiles.openfreemap.org/styles/bright",
  },

  EsriImagery: {
    name: "Satellite",
    style: {
      version: 8,
      sources: {
        imagery: {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "© Esri, Maxar, Earthstar Geographics",
        },
      },
      layers: [
        {
          id: "imagery",
          type: "raster",
          source: "imagery",
        },
      ],
    },
  },
};