/*
 * LegendControl
 * --------------------------------------------------------------------------
 * MapLibre control displaying legend entries for coastal mapping layers.
 */

export default class LegendControl {

  constructor(items) {
    this.items = items;
    this.map = undefined;
    this.container = undefined;
  }

  /*
   * Convert a year/colour array into a CSS linear gradient.
   */
  createGradient(colours) {
    const firstYear = colours[0][0];
    const lastYear = colours[colours.length - 1][0];

    const stops = colours.map(([year, colour]) => {
      const position =
        ((year - firstYear) / (lastYear - firstYear)) * 100;

      return `${colour} ${position}%`;
    });

    return `linear-gradient(to right, ${stops.join(", ")})`;
  }

  /*
   * Create positioned year labels for a gradient legend item.
   */
  createGradientLabels(colours) {
    const labels = document.createElement("div");
    labels.className = "legend-labels";

    const firstYear = colours[0][0];
    const lastYear = colours[colours.length - 1][0];

    colours.forEach(([year], index) => {
      const position =
        ((year - firstYear) / (lastYear - firstYear)) * 100;

      const label = document.createElement("span");
      label.textContent = year;
      label.style.left = `${position}%`;

      if (index === 0) {
        label.classList.add("legend-label-first");
      } else if (index === colours.length - 1) {
        label.classList.add("legend-label-last");
      }

      labels.appendChild(label);
    });

    return labels;
  }

  /*
   * Create one gradient legend item.
   */
  createGradientItem(item) {
    const section = document.createElement("div");
    section.className = "legend-item legend-gradient-item";

    const title = document.createElement("div");
    title.className = "legend-item-title";
    title.textContent = item.title;

    const colourRamp = document.createElement("div");
    colourRamp.className = "legend-colour-ramp";
    colourRamp.style.background =
      this.createGradient(item.colours);

    const labels =
      this.createGradientLabels(item.colours);

    section.appendChild(title);
    section.appendChild(colourRamp);
    section.appendChild(labels);

    return section;
  }

  onAdd(map) {
    this.map = map;

    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl maplibregl-ctrl-group legend-control";

    const heading = document.createElement("div");
    heading.className = "legend-heading";
    heading.textContent = "Legend";

    this.container.appendChild(heading);

    this.items.forEach((item) => {
      if (item.type === "gradient") {
        this.container.appendChild(
          this.createGradientItem(item),
        );
      }
    });

    return this.container;
  }

  onRemove() {
    this.container?.remove();

    this.map = undefined;
    this.container = undefined;
  }
}