/*
 * LegendControl
 * --------------------------------------------------------------------------
 * MapLibre control displaying legend entries for coastal mapping layers.
 */

import {getFutureScenarioStyle} from "../layers/FutureStyles.js";

export default class LegendControl {

  constructor(items) {
    this.futureSection = undefined;
    this.items = items;
    this.map = undefined;
    this.container = undefined;
    this.sections = new Map();
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
    section.dataset.group = item.group;

    const title = document.createElement("div");
    title.className = "legend-item-title";
    title.textContent = item.title;

    const colourRamp = document.createElement("div");
    colourRamp.className = "legend-colour-ramp";
    colourRamp.style.background =
      this.createGradient(item.colours);

    const labels = this.createGradientLabels(item.colours);

    section.appendChild(title);
    section.appendChild(colourRamp);
    section.appendChild(labels);

    // Optional descriptive labels beneath the numeric scale
  if (item.leftLabel || item.rightLabel) {
      const directionLabels = document.createElement("div");
      directionLabels.className = "legend-direction-labels";

      const left = document.createElement("span");
      left.textContent = item.leftLabel ?? "";

      const right = document.createElement("span");
      right.textContent = item.rightLabel ?? "";

      directionLabels.appendChild(left);
      directionLabels.appendChild(right);

      section.appendChild(directionLabels);
      }
    return section;
  }

  createFutureItem() {
    const section = document.createElement("div");
    section.className = "legend-item legend-future-item";
    section.hidden = true;

    const title = document.createElement("div");
    title.className = "legend-item-title";
    title.dataset.role = "future-title";

    const graphicRow = document.createElement("div");
    graphicRow.className = "future-legend-row";

    const graphic = document.createElement("div");
    graphic.className = "future-legend-graphic";

    const uncertainty95 = document.createElement("div");
    uncertainty95.className =
      "future-legend-polygon future-legend-polygon-95";
    uncertainty95.dataset.role = "future-uncertainty-95";

    const uncertainty68 = document.createElement("div");
    uncertainty68.className =
      "future-legend-polygon future-legend-polygon-68";
    uncertainty68.dataset.role = "future-uncertainty-68";

    const shoreline = document.createElement("div");
    shoreline.className = "future-legend-line";
    shoreline.dataset.role = "future-line-symbol";

    /*
    * Append in back-to-front drawing order.
    */
    graphic.appendChild(uncertainty95);
    graphic.appendChild(uncertainty68);
    graphic.appendChild(shoreline);

    const labels = document.createElement("div");
    labels.className = "future-legend-interval-labels";

    const label95 = document.createElement("span");
    label95.className = "future-legend-label-95";
    label95.textContent = "95%";

    const label68 = document.createElement("span");
    label68.className = "future-legend-label-68";
    label68.textContent = "68%";

    labels.appendChild(label95);
    labels.appendChild(label68);

    graphicRow.appendChild(graphic);
    graphicRow.appendChild(labels);

    section.appendChild(title);
    section.appendChild(graphicRow);

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
      if (item.type !== "gradient") {
        return;
      }

      const section = this.createGradientItem(item);

      this.sections.set(item.group, section);
      this.container.appendChild(section);
    });

    this.futureSection = this.createFutureItem();
    this.container.appendChild(this.futureSection);

    return this.container;
  }

  updateFuture(futureState) {
    if (!this.futureSection) {
      return;
    }

    const visible =
      futureState?.scenario &&
      futureState.scenario !== "None";

    this.futureSection.hidden = !visible;

    if (!visible) {
      this.updateContainerVisibility();
      return;
    }

    const style = getFutureScenarioStyle(
      futureState.scenario,
    );

    if (!style) {
      this.futureSection.hidden = true;
      this.updateContainerVisibility();
      return;
    }

    const title = this.futureSection.querySelector(
      '[data-role="future-title"]',
    );

    const lineSymbol = this.futureSection.querySelector(
      '[data-role="future-line-symbol"]',
    );

    const uncertainty95 = this.futureSection.querySelector(
      '[data-role="future-uncertainty-95"]',
    );

    const uncertainty68 = this.futureSection.querySelector(
      '[data-role="future-uncertainty-68"]',
    );

    title.textContent =
      `Future MHWS — ${style.label}, ${futureState.year}`;

    lineSymbol.style.borderTopColor = style.colour;
    lineSymbol.style.borderTopWidth =
      `${style.shoreline.width}px`;

    lineSymbol.style.opacity =
      style.shoreline.opacity;

    lineSymbol.style.borderTopStyle =
      style.shoreline.dasharray ? "dashed" : "solid";

    uncertainty95.style.backgroundColor = style.colour;
    uncertainty68.style.backgroundColor = style.colour;

    uncertainty95.style.opacity =
      style.uncertainty.opacity95 ?? style.uncertainty.opacity;

    uncertainty68.style.opacity =
      style.uncertainty.opacity68 ?? style.uncertainty.opacity;

    this.updateContainerVisibility();
  }

  updateContainerVisibility() {
    if (!this.container) {
      return;
    }

    const historicalVisible = Array.from(
      this.sections.values(),
    ).some((section) => !section.hidden);

    const futureVisible =
      this.futureSection &&
      !this.futureSection.hidden;

    this.container.hidden =
      !historicalVisible && !futureVisible;
  }

  updateVisibility(layerGroups) {
    this.sections.forEach((section, groupId) => {
      const group = layerGroups[groupId];

      section.hidden = !group?.visible;
    });

    this.updateContainerVisibility();
  }
  
  onRemove() {
    this.container?.remove();
    this.futureSection = undefined;
    this.map = undefined;
    this.container = undefined;
  }
}