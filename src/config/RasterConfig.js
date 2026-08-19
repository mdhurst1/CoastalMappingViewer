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

export const LOCAL_RASTER_LAYERS = {

  lidarDTM: {
    id: "lidar-dtm",
    name: "LiDAR DTM",

    mosaic:
      "http://127.0.0.1:9000/Montrose_DTM_mosaic.json",

    tileUrl:
      "http://127.0.0.1:8000/mosaicjson/tiles/WebMercatorQuad/{z}/{x}/{y}.png",

    minzoom: 14,
    maxzoom: 17,

    visible: false,
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