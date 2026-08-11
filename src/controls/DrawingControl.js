/*
 * Polygon drawing control
 * --------------------------------------------------------------------------
 * Allows the user to draw a single selection polygon.
 *
 * Analysis of the polygon is deliberately handled elsewhere.
 */

import maplibregl from "maplibre-gl";

import {
  TerraDraw,
  TerraDrawPolygonMode,
} from "terra-draw";

import {
  TerraDrawMapLibreGLAdapter,
} from "terra-draw-maplibre-gl-adapter";


export class DrawingControl {
  constructor(onPolygonFinished = null) {
    this.draw = null;
    this.currentPolygon = null;
    this.onPolygonFinished = onPolygonFinished;
  }


  onAdd(map) {
    this.map = map;

    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl maplibregl-ctrl-group";

    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.className = "polygon-draw-control";
    this.button.title = "Draw selection polygon";
    this.button.setAttribute(
      "aria-label",
      "Draw selection polygon",
    );

    this.button.innerHTML = `
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
      >
        <path
          d="M5 6 L18 4 L20 17 L8 20 Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <circle cx="5" cy="6" r="1.5" fill="currentColor" />
        <circle cx="18" cy="4" r="1.5" fill="currentColor" />
        <circle cx="20" cy="17" r="1.5" fill="currentColor" />
        <circle cx="8" cy="20" r="1.5" fill="currentColor" />
      </svg>
    `;

    this.handleClick =
      this.handleClick.bind(this);

    this.handleDrawingFinished =
      this.handleDrawingFinished.bind(this);

    this.button.addEventListener(
      "click",
      this.handleClick,
    );

    this.container.appendChild(this.button);

    if (this.map.isStyleLoaded()) {
      this.initialiseDrawing();
    } 
    else {
      this.handleStyleLoad =
        this.initialiseDrawing.bind(this);

      this.map.once(
        "style.load",
        this.handleStyleLoad,
      );
    }


    return this.container;
  }


  initialiseDrawing() {
  if (this.draw) {
    return;
  }

  this.draw = new TerraDraw({
    adapter: new TerraDrawMapLibreGLAdapter({
      map: this.map,
      lib: maplibregl,
    }),

    modes: [
      new TerraDrawPolygonMode(),
    ],
  });

  this.draw.start();

  this.draw.on(
    "finish",
    this.handleDrawingFinished,
  );

  this.draw.setMode("static");
}


  handleClick() {
    if (!this.draw) {
      console.warn(
        "Drawing tools are not ready yet.",
      );

      return;
    }

    const isActive =
      this.button.classList.contains("active");

    if (isActive) {
      /*
      * Cancel polygon drawing.
      */
      this.draw.setMode("static");

      this.button.classList.remove("active");

      return;
    }

    /*
    * Starting a new polygon replaces the previous one.
    */
    if (this.currentPolygon) {
      this.draw.clear();
      this.currentPolygon = null;
    }

    this.draw.setMode("polygon");

    this.button.classList.add("active");
  }

  handleDrawingFinished(id, context) {
  /*
   * Ignore finishes caused by anything except drawing.
   */
  if (context.action !== "draw") {
    return;
  }

  const polygon = this.draw
    .getSnapshot()
    .find((feature) => feature.id === id);

  if (!polygon) {
    return;
  }

  this.currentPolygon = polygon;

  console.log(
    "Selection polygon completed:",
    polygon,
  );

  /*
   * Stop creating more polygons while leaving this polygon visible.
   */
  this.draw.setMode("static");

  this.button.classList.remove("active");

  /*
   * Pass the completed polygon back to the application.
   */
  this.onPolygonFinished?.(polygon);
}

  onRemove() {
    this.button.removeEventListener(
      "click",
      this.handleClick,
    );

    if (this.handleStyleLoad) {
      this.map.off(
        "style.load",
        this.handleStyleLoad,
      );
    }

    this.draw?.stop();

    this.container.remove();

    this.draw = null;
    this.map = undefined;
  }
}