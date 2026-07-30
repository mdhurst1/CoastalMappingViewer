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

    const shorelineRow = document.createElement("div");
    shorelineRow.className = "legend-symbol-row";

    const shorelineSymbol = document.createElement("span");
    shorelineSymbol.className = "legend-line-symbol";
    shorelineSymbol.dataset.role = "future-line-symbol";

    const shorelineLabel = document.createElement("span");
    shorelineLabel.textContent = "Predicted MHWS";

    shorelineRow.appendChild(shorelineSymbol);
    shorelineRow.appendChild(shorelineLabel);

    const uncertaintyRow = document.createElement("div");
    uncertaintyRow.className = "legend-symbol-row";

    const uncertaintySymbol = document.createElement("span");
    uncertaintySymbol.className = "legend-fill-symbol";
    uncertaintySymbol.dataset.role =
      "future-uncertainty-symbol";

    const uncertaintyLabel = document.createElement("span");
    uncertaintyLabel.textContent = "95% uncertainty";

    uncertaintyRow.appendChild(uncertaintySymbol);
    uncertaintyRow.appendChild(uncertaintyLabel);

    section.appendChild(title);
    section.appendChild(shorelineRow);
    section.appendChild(uncertaintyRow);

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

    const uncertaintySymbol =
      this.futureSection.querySelector(
        '[data-role="future-uncertainty-symbol"]',
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

    uncertaintySymbol.style.backgroundColor =
      style.colour;

    uncertaintySymbol.style.opacity =
      style.uncertainty.opacity;

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