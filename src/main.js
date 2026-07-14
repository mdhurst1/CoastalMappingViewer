import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";

const map = new maplibregl.Map({
    container: "map",

    style: {
        version: 8,

        sources: {
            basemap: {
                type: "raster",
                tiles: [
                    "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                ],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors"
            }
        },

        layers: [
            {
                id: "basemap",
                type: "raster",
                source: "basemap"
            }
        ]
    },

    center: [-2.45, 56.73],
    zoom: 12
});

map.addControl(
    new maplibregl.NavigationControl(),
    "top-right"
);