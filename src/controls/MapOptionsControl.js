/*
 * MapOptionsControl
 * --------------------------------------------------------------------------
 * Combined MapLibre control for switching basemaps and toggling data layers.
 */

export default class MapOptionsControl {

  constructor(
    basemaps,
    initialBasemap,
    layerGroups,
    onVisibilityChanged,
  ) {
    this.basemaps = basemaps;
    this.activeBasemap = initialBasemap;
    this.layerGroups = layerGroups;
    this.onVisibilityChanged = onVisibilityChanged;

    this.map = undefined;
    this.container = undefined;
    this.panel = undefined;
  }

  onAdd(map) {
    this.map = map;

    // Outer control container
    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl map-options-control";

    // Horizontal row containing the two icon buttons
    const buttonRow = document.createElement("div");
    buttonRow.className = "map-options-buttons";

    const basemapButton = this.createButton(
      "Choose basemap",
      this.getBasemapIcon(),
      () => this.showBasemapPanel(),
    );

    const layerButton = this.createButton(
      "Choose visible layers",
      this.getLayerIcon(),
      () => this.showLayerPanel(),
    );

    buttonRow.appendChild(basemapButton);
    buttonRow.appendChild(layerButton);

    // Dropdown panel displayed beneath the icon buttons
    this.panel = document.createElement("div");
    this.panel.className = "map-options-panel";
    this.panel.hidden = true;

    this.container.appendChild(buttonRow);
    this.container.appendChild(this.panel);

    return this.container;
  }

  createButton(title, icon, clickHandler) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "map-options-button";
    button.title = title;
    button.setAttribute("aria-label", title);
    button.innerHTML = icon;

    button.addEventListener("click", clickHandler);

    return button;
  }

  showBasemapPanel() {
    const isAlreadyOpen =
      !this.panel.hidden &&
      this.panel.dataset.panel === "basemaps";

    if (isAlreadyOpen) {
      this.panel.hidden = true;
      return;
    }

    this.panel.dataset.panel = "basemaps";
    this.panel.replaceChildren();

    const title = document.createElement("div");
    title.className = "map-options-title";
    title.textContent = "Basemap";

    this.panel.appendChild(title);

    Object.entries(this.basemaps).forEach(
      ([basemapId, basemap]) => {
        const label = document.createElement("label");
        label.className = "map-options-option";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "basemap";
        input.value = basemapId;
        input.checked = basemapId === this.activeBasemap;

        input.addEventListener("change", () => {
          if (!input.checked) {
            return;
          }

          this.activeBasemap = basemapId;
          this.map.setStyle(basemap.style);
        });

        label.appendChild(input);
        label.append(` ${basemap.name}`);

        this.panel.appendChild(label);
      },
    );

    this.panel.hidden = false;
  }

  showLayerPanel() {
    const isAlreadyOpen =
      !this.panel.hidden &&
      this.panel.dataset.panel === "layers";

    if (isAlreadyOpen) {
      this.panel.hidden = true;
      return;
    }

    this.panel.dataset.panel = "layers";
    this.panel.replaceChildren();

    const title = document.createElement("div");
    title.className = "map-options-title";
    title.textContent = "Layers";

    this.panel.appendChild(title);

    Object.entries(this.layerGroups).forEach(
      ([groupId, group]) => {
        const label = document.createElement("label");
        label.className = "map-options-option";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = groupId;
        input.checked = group.visible;

        input.addEventListener("change", () => {
          group.visible = input.checked;
          this.onVisibilityChanged();
        });

        label.appendChild(input);
        label.append(` ${group.name}`);

        this.panel.appendChild(label);
      },
    );

    this.panel.hidden = false;
  }

  getBasemapIcon() {
    return `
      <svg
        class="map-options-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M20.5 3 15 5.1 9 3 3.5 5A1 1 0 0 0 3 5.9V21l6-2.1 6 2.1 5.5-2a1 1 0 0 0 .5-.9V4a1 1 0 0 0-1.5-1ZM10 5.3l4 1.4v12l-4-1.4v-12Zm-5 1.4 3-1.1v11.7l-3 1.1V6.7Zm14 10.6-3 1.1V6.7l3-1.1v11.7Z"
        />
      </svg>
    `;
  }

  getLayerIcon() {
    return `
      <svg
        class="map-options-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M3 7c3-2 6-2 9 0s6 2 9 0"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
        <path
          d="M3 12c3-2 6-2 9 0s6 2 9 0"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
        <path
          d="M3 17c3-2 6-2 9 0s6 2 9 0"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
    `;
  }

  onRemove() {
    this.container?.remove();

    this.map = undefined;
    this.container = undefined;
    this.panel = undefined;
  }
}