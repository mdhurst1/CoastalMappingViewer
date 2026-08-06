/*
 * Polygon drawing control
 * --------------------------------------------------------------------------
 * Provides the map button used to start drawing a selection polygon.
 *
 * Polygon drawing behaviour will be added separately.
 */

export class DrawingControl {
  onAdd(map) {
    this.map = map;

    // Use MapLibre's standard control container styling
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

    // Polygon icon
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

        <circle
          cx="5"
          cy="6"
          r="1.5"
          fill="currentColor"
        />

        <circle
          cx="18"
          cy="4"
          r="1.5"
          fill="currentColor"
        />

        <circle
          cx="20"
          cy="17"
          r="1.5"
          fill="currentColor"
        />

        <circle
          cx="8"
          cy="20"
          r="1.5"
          fill="currentColor"
        />
      </svg>
    `;

    this.handleClick =
      this.handleClick.bind(this);

    this.button.addEventListener(
      "click",
      this.handleClick,
    );

    this.container.appendChild(this.button);

    return this.container;
  }

  handleClick() {
    // Temporary check before adding polygon drawing
    console.log("Polygon drawing button clicked");
  }

  onRemove() {
    this.button.removeEventListener(
      "click",
      this.handleClick,
    );

    this.container.remove();
    this.map = undefined;
  }
}