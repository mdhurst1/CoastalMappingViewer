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

    Object.values(LOCAL_RASTER_LAYERS).forEach((raster) => {

        const sourceId = `${raster.id}-source`;

        // set up the tile URL for the raster layer, including the mosaic URL as a query parameter
        let tileUrl =
            `${raster.tileUrl}` +
            `?url=${encodeURIComponent(raster.mosaic)}` +
            `&tilesize=256`;

        if (raster.rescale) {
            tileUrl += `&rescale=${raster.rescale}`;
        }

        if (raster.colormap) {
            tileUrl += `&colormap=${encodeURIComponent(JSON.stringify(raster.colormap))}`;
        }

        if (raster.algorithm) {
            tileUrl += `&algorithm=${raster.algorithm}`;
        }

        if (raster.buffer) {
            tileUrl += `&buffer=${raster.buffer}`;
        }
            
        console.log("Raster tile URL:", tileUrl);

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
                paint: {
                    "raster-opacity": raster.opacity ?? 1,
                },
            });
        }
        console.log("Added raster layer:", raster.id);
    });
}

// apply the raster layer visibility state to the map
export function applyRasterVisibility(map, rasterState) {

    // loop through the raster layers and set their visibility based on the state
    Object.values(LOCAL_RASTER_LAYERS).forEach((raster) => {

        // check if the layer exists on the map before trying to set its visibility
        if (!map.getLayer(raster.id)) {
            return;
        }

        // set visibility based on the associated raster state
        map.setLayoutProperty(
            raster.id,
            "visibility",
            rasterState[raster.stateKey] ? "visible" : "none",
        );
    });
}