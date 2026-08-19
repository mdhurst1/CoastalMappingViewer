/*
 * Raster
 * --------------------------------------------------------------------------
 * Adds and manages raster tile layers.
 *
 * MDH, August 2026
 * --------------------------------------------------------------------------
 */

// import layer definitions
import { LOCAL_RASTER_LAYERS } from "../config/RasterConfig.js";

// add the raster layers to the map
export function addRasterLayers(map) {

    Object.values(RASTER_LAYERS).forEach((raster) => {

        const sourceId = `${raster.id}-source`;

        // set up the tile URL for the raster layer, including the mosaic URL as a query parameter
        const tileUrl =`${raster.tileUrl}?url=${encodeURIComponent(raster.mosaic)}`;

        // add the raster source if it doesn't already exist
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: "raster",
                tiles: [tileUrl],
                tileSize: 256,
                minzoom: raster.minzoom,
                maxzoom: raster.maxzoom,
            });
        }

        // add the raster layer if it doesn't already exist
        if (!map.getLayer(raster.id)) {
            map.addLayer({
                id: raster.id,
                type: "raster",
                source: sourceId,
                layout: {
                    visibility: "none",
                },
            });
        }
    });
}

// apply the raster layer visibility state to the map
export function applyRasterVisibility(map, rasterState) {

    // loop through the raster layers and set their visibility based on the state
    Object.entries(RASTER_LAYERS).forEach(([key, raster]) => {

        // check if the layer exists on the map before trying to set its visibility
        if (!map.getLayer(raster.id)) {
            return;
        }

        // set the visibility of the raster layer based on the state
        map.setLayoutProperty(
            raster.id,
            "visibility",
            rasterState[key] ? "visible" : "none",
        );
    });
}