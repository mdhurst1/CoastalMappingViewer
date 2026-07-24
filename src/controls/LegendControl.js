/*
 * LegendControl
 * --------------------------------------------------------------------------
 * MapLibre control displaying the legend for coastal mapping layers.
 */

export default class LegendControl {

  constructor() {
    this.map = undefined;
    this.container = undefined;
  }

  onAdd(map) {
    this.map = map;

    // Outer MapLibre control container
    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl maplibregl-ctrl-group legend-control";

    // Legend title
    const title = document.createElement("div");
    title.className = "legend-title";
    title.textContent = "MHWS shoreline";

    // Colour gradient matching getMHWSPaint()
    const colourRamp = document.createElement("div");
    colourRamp.className = "legend-colour-ramp";

    // Year labels beneath the gradient
    const labels = document.createElement("div");
    labels.className = "legend-labels";

    [1900, 1970, 2000, 2026].forEach((year) => {
      const label = document.createElement("span");
      label.textContent = year;
      labels.appendChild(label);
    });

    this.container.appendChild(title);
    this.container.appendChild(colourRamp);
    this.container.appendChild(labels);

    return this.container;
  }

  onRemove() {
    this.container?.remove();

    this.map = undefined;
    this.container = undefined;
  }
}