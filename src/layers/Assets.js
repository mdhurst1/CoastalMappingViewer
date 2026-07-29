/*
 * OpenStreetMap asset layers
 * --------------------------------------------------------------------------
 * Adds buildings, roads and railways from streamed OpenMapTiles vector tiles.
 *
 * The current tiles are hosted by OpenFreeMap. The source uses the standard
 * OpenMapTiles schema, allowing the tile provider to be replaced later
 * without changing the layer definitions.
 *
 * To migrate to a self-hosted tile server:
 *
 * 1. Host an OpenMapTiles-compatible TileJSON endpoint.
 * 2. Change ASSET_TILE_SOURCE.url below.
 * 3. Confirm that the source-layer names and attributes still match the
 *    OpenMapTiles schema:
 *
 *        building
 *        transportation
 *
 * No other application code should need to change.
 */

// import styles from adjacent AssetStyles.js 
import {BuildingFillStyle, BuildingOutlineStyle, RoadStyle, RailwayStyle} from "./AssetStyles.js";

const AssetSourceID = "osm-assets-source";

/*
 * External vector tile source
 * --------------------------------------------------------------------------
 * MIGRATION POINT:
 *
 * Replace this URL with the TileJSON URL from a self-hosted tile server.
 *
 * For example:
 *
 * url: "https://maps.example.ac.uk/tiles/planet.json"
 *
 * Keep the source type as "vector".
 */

const ASSET_TILE_SOURCE = {
  type: "vector",
  url: "https://tiles.openfreemap.org/planet",
};

/*
 * Asset layer identifiers
 * --------------------------------------------------------------------------
 * These IDs are used both when adding layers and when updating visibility.
 */

const ASSET_LAYER_IDS = {
  buildings: [
    "osm-buildings-fill",
    "osm-buildings-outline",
  ],

  roads: [
    "osm-roads",
  ],

  railways: [
    "osm-railways",
  ],
};

/*
 * Add all asset layers
 * --------------------------------------------------------------------------
 * Layers are initially hidden. Their visibility is subsequently controlled
 * by the asset checkboxes in MapOptionsControl.
 */

export function addAssetLayers(map) {

  /*
   * Add the shared vector tile source.
   *
   * A separate source ID is used rather than relying on a source contained
   * in the active basemap. This means the asset layers also work when the
   * Esri satellite basemap is selected.
   */

  if (!map.getSource(AssetSourceID)) {
    map.addSource(
      AssetSourceID,
      ASSET_TILE_SOURCE,
    );
  }

  addBuildingLayers(map);
  addRoadLayer(map);
  addRailwayLayer(map);
}

/*
 * Buildings
 * --------------------------------------------------------------------------
 * Buildings are polygons in the OpenMapTiles "building" source-layer.
 *
 * OpenFreeMap's building data begins at zoom level 13, so buildings will not
 * appear while viewing the map at smaller scales.
 */

function addBuildingLayers(map) {

  if (!map.getLayer("osm-buildings-fill")) {
    map.addLayer({
      id: "osm-buildings-fill",
      type: "fill",
      source: AssetSourceID,
      "source-layer": "building",

      ...BuildingFillStyle,
    });
  }

  if (!map.getLayer("osm-buildings-outline")) {
    map.addLayer({
      id: "osm-buildings-outline",
      type: "line",
      source: AssetSourceID,
      "source-layer": "building",

      ...BuildingOutlineStyle,
    });
  }
}

/*
 * Roads
 * --------------------------------------------------------------------------
 * Roads are selected from the OpenMapTiles "transportation" source-layer.
 *
 * The filter includes normal vehicular road classes while excluding paths,
 * tracks, ferries, railways and aerial transport.
 */

function addRoadLayer(map) {

  if (map.getLayer("osm-roads")) {
    return;
  }

  map.addLayer({
    id: "osm-roads",
    type: "line",
    source: AssetSourceID,
    "source-layer": "transportation",

    filter: [
        "match",
        ["get", "class"],
        [
            "motorway",
            "trunk",
            "primary",
            "secondary",
            "tertiary",
            "minor",
            "service",
        ],
        true,
        false,
    ],

    ...RoadStyle,
  });
}

/*
 * Railways
 * --------------------------------------------------------------------------
 * Railways are also stored in the OpenMapTiles "transportation" source-layer,
 * where the class attribute is "rail".
 */

function addRailwayLayer(map) {

    if (map.getLayer("osm-railways")) {
        return;
    }

    map.addLayer({
        id: "osm-railways",
        type: "line",
        source: AssetSourceID,
        "source-layer": "transportation",

        filter: [
            "match",
            ["get", "class"],
            ["rail", "transit"],
            true,
            false,
        ],

        ...RailwayStyle,
    });
}

/*
 * Apply asset visibility
 * --------------------------------------------------------------------------
 * Restores the visibility of each asset group after:
 *
 * - a checkbox changes;
 * - the map initially loads; or
 * - the basemap style is replaced using map.setStyle().
 */

export function applyAssetVisibility(map, assetState) {

  Object.entries(ASSET_LAYER_IDS).forEach(
    ([assetId, layerIds]) => {

      const visibility =
        assetState[assetId] ? "visible" : "none";

      layerIds.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(
            layerId,
            "visibility",
            visibility,
          );
        }
      });
    },
  );
}