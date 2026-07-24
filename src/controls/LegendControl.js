/*
 * LegendControl
 * --------------------------------------------------------------------------
 * MapLibre control displaying the legend for coastal mapping layers.
 */

export default class LegendControl {

  constructor(colours) {
    this.colours = colours;
    this.map = undefined;
    this.container = undefined;
  }

  createGradient() {
    const firstYear = this.colours[0][0];
    const lastYear = this.colours[this.colours.length - 1][0];

    const stops = this.colours.map(([year, colour]) => {
      const position =
        ((year - firstYear) / (lastYear - firstYear)) * 100;

      return `${colour} ${position}%`;
    });

    return `linear-gradient(to right, ${stops.join(", ")})`;
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
    title.textContent = "MHWS shorelines";

    // Colour gradient matching getMHWSPaint()
    const colourRamp = document.createElement("div");
    colourRamp.className = "legend-colour-ramp";
    colourRamp.style.background = this.createGradient();

    // Year labels beneath the gradient
    const labels = document.createElement("div");
    labels.className = "legend-labels";

    const firstYear = this.colours[0][0];
    const lastYear = this.colours[this.colours.length - 1][0];

    this.colours.forEach(([year], index) => {
    const position =
        ((year - firstYear) / (lastYear - firstYear)) * 100;

    const label = document.createElement("span");
    label.textContent = year;
    label.style.left = `${position}%`;
    
    if (index === 0) {
        label.classList.add("legend-label-first");
    } else if (index === this.colours.length - 1) {
        label.classList.add("legend-label-last");
    }
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