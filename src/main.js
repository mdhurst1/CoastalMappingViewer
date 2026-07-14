import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";

console.log("main.js loaded");

const map = new maplibregl.Map({
  container: "map",

  style: {
    version: 8,

    sources: {
      osm: {
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
        id: "osm",
        type: "raster",
        source: "osm"
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

map.addControl(
  new maplibregl.ScaleControl({
    maxWidth: 150,
    unit: "metric"
  }),
  "bottom-left"
);

map.on("load", () => {
  console.log("Map loaded successfully");
});

map.on("error", (event) => {
  console.error("MapLibre error:", event.error);
});