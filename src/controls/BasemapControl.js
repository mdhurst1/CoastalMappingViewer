/*
 * BasemapControl
 * --------------------------------------------------------------------------
 * Custom MapLibre control for switching between basemap styles.
 */

export default class BasemapControl {

  constructor(basemaps, initialBasemap) {
    this.basemaps = basemaps;
    this.activeBasemap = initialBasemap;
    this.map = undefined;
    this.container = undefined;
  }

  onAdd(map) {
    this.map = map;

    // MapLibre control container
    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl maplibregl-ctrl-group basemap-control";

    // Control heading
    const title = document.createElement("div");
    title.className = "basemap-control-title";
    title.textContent = "Basemap";

    this.container.appendChild(title);

    // Create one radio button per basemap
    Object.entries(this.basemaps).forEach(([basemapId, basemap]) => {
      const label = document.createElement("label");
      label.className = "basemap-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "basemap";
      input.value = basemapId;
      input.checked = basemapId === this.activeBasemap;

      input.addEventListener("change", () => {
        if (!input.checked) {
          return;
        }

        this.setBasemap(basemapId);
      });

      label.appendChild(input);
      label.append(` ${basemap.name}`);

      this.container.appendChild(label);
    });

    return this.container;
  }

  setBasemap(basemapId) {
    const basemap = this.basemaps[basemapId];

    if (!basemap) {
      console.error(`Unknown basemap: ${basemapId}`);
      return;
    }

    this.activeBasemap = basemapId;
    this.map.setStyle(basemap.style);
  }

  onRemove() {
    this.container?.remove();

    this.map = undefined;
    this.container = undefined;
  }
}