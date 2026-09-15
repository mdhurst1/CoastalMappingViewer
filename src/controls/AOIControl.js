/*
 * AOIControl
 * --------------------------------------------------------------------------
 * MapLibre control for navigating to exemplar areas of interest.
 *
 * MDH, September 2026
 */

import maplibregl from "maplibre-gl";

export default class AOIControl {

  constructor(url) {
    this.url = url;
    this.map = undefined;
    this.container = undefined;
    this.features = [];
  }


  async onAdd(map) {

    this.map = map;

    this.container = document.createElement("div");

    this.container.className =
      "maplibregl-ctrl maplibregl-ctrl-group aoi-control";

    const select = document.createElement("select");

    select.className = "aoi-select";

    const defaultOption =
      document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent =
      "Exemplar locations";

    select.appendChild(defaultOption);


    try {

      const response = await fetch(this.url);

      if (!response.ok) {
        throw new Error(
          `Could not load AOI data: ${response.status}`,
        );
      }

      const geojson = await response.json();

      this.features =
        geojson.features ?? [];


      this.features
        .filter(feature => feature.properties?.Name)
        .sort((a, b) =>
          a.properties.Name.localeCompare(
            b.properties.Name,
          ),
        )
        .forEach((feature, index) => {

          const option =
            document.createElement("option");

          option.value = index;
          option.textContent =
            feature.properties.Name;

          select.appendChild(option);
        });


    } catch (error) {

      console.error(
        "AOIControl: Could not load AOI data.",
        error,
      );

      select.disabled = true;
    }


    select.addEventListener(
      "change",
      () => {

        if (select.value === "") {
          return;
        }

        const feature =
          this.features[Number(select.value)];

        this.zoomToFeature(feature);
      },
    );


    this.container.appendChild(select);

    return this.container;
  }


  zoomToFeature(feature) {

    if (!feature?.geometry) {
      return;
    }

    const bounds =
      this.getGeometryBounds(feature.geometry);

    if (!bounds) {
      return;
    }

    this.map.fitBounds(
      bounds,
      {
        padding: 60,
        duration: 1000,
        maxZoom: 15,
      },
    );
  }


  getGeometryBounds(geometry) {

    const coordinates = [];

    const collectCoordinates = coords => {

      if (
        Array.isArray(coords) &&
        typeof coords[0] === "number"
      ) {
        coordinates.push(coords);
        return;
      }

      coords.forEach(collectCoordinates);
    };


    collectCoordinates(
      geometry.coordinates,
    );


    if (coordinates.length === 0) {
      return null;
    }


    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;


    coordinates.forEach(([x, y]) => {

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);

      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });


    return [
      [minX, minY],
      [maxX, maxY],
    ];
  }


  onRemove() {

    this.container?.remove();

    this.map = undefined;
    this.container = undefined;
  }
}