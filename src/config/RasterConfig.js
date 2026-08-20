/*
 * Raster layer definitions
 * --------------------------------------------------------------------------
 * Defines raster datasets available to the application.
 *
 * Raster layers are served as XYZ tiles and displayed using MapLibre raster
 * sources. This could include LiDAR-derived elevation products, aerial imagery,
 * and other raster datasets.
 * 
 * This is currently a local configuration file, reliant on having a local 
 * server storing the raster tiles and a Titiler server that is interfacing 
 * between the local tile server and the application. The Titiler server is 
 * running to serve the raster tiles. In future, this could be replaced with 
 * a remote server or cloud-based raster tile service.
 *
 * MDH, August 2026
 * --------------------------------------------------------------------------
 */
// import colourRamp function
import { interpolateColourRamp } from "../utils/ColourRamp.js";

const LIDAR_COLOUR_STOPS = {
    0:   "#08519c", // -2 m
    12:  "#2171b5", // -1 m
    23:  "#9ecae1", //  0 m
    35:  "#deebf7", //  1 m
    46:  "#f7fbff", //  2 m

    // quick transition to yellow
    52:  "#fff3c4", // ~2.5 m
    58:  "#fee391", // ~3 m
    69:  "#fec44f", // ~4 m

    // higher ground
    81:  "#e8d878", // 5 m
    104: "#c8cf79", // 7 m
    139: "#9fb67d", // 10 m
    197: "#b39a6a", // 15 m
    255: "#8c7554", // 20 m
};

export const LOCAL_RASTER_LAYERS = {

  lidarDTM: {
    id: "lidar-dtm",
    name: "LiDAR DTM",

    mosaic:
      "http://127.0.0.1:9000/Montrose_DEM_Mosaic.json",

    tileUrl:
      "http://127.0.0.1:8000/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}.png",

    minzoom: 14,
    maxzoom: 17,

    visible: false,
    stateKey: "lidarDTM",

    rescale: "-2,20",

    colormap: interpolateColourRamp(LIDAR_COLOUR_STOPS),
  },

  /* Hillshade layer goes in here
  *
  *
  * */

  hillshade: {
    id: "lidar-hillshade",
    name: "LiDAR Hillshade",

    mosaic:
        "http://127.0.0.1:9000/Montrose_DEM_Mosaic.json",

    tileUrl:
        "http://127.0.0.1:8000/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}.png",

    minzoom: 14,
    maxzoom: 17,

    stateKey: "lidarDTM",

    algorithm: "hillshade",
    buffer: 3,

    opacity: 0.35,
},

  /** Aerial photography layer goes here
   * 
   * aerialPhotography: {   aerial: {
   * id: "aerial",
   * name: "Aerial photography",
   * ...
   * }
   */
};
