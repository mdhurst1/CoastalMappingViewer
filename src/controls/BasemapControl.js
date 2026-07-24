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
    this.panel = undefined;
  }

  onAdd(map) {
    this.map = map;

    // MapLibre control container
    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl maplibregl-ctrl-group basemap-control";

    // Button used to open and close the panel
    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "basemap-toggle";
    toggleButton.title = "Choose basemap";
    toggleButton.setAttribute("aria-label", "Choose basemap");
    toggleButton.setAttribute("aria-expanded", "false");
    
    toggleButton.innerHTML = `
    <svg
        class="basemap-toggle-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path
        fill="currentColor"
        d="M12 2 1 7l11 5 9-4.09V17h2V7L12 2zm0 11L1 8v2l11 5 11-5V8l-11 5zm0 4L1 12v2l11 5 11-5v-2l-11 5z"
        />
    </svg>
    `;

    // Expandable panel containing the basemap options
    this.panel = document.createElement("div");
    this.panel.className = "basemap-panel";
    this.panel.hidden = true;

    // Control heading
    const title = document.createElement("div");
    title.className = "basemap-control-title";
    title.textContent = "Basemap";

    this.panel.appendChild(title);

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
          this.setBasemap(basemapId);
        }

        this.setBasemap(basemapId);
      });

      label.appendChild(input);
      label.append(` ${basemap.name}`);

      this.panel.appendChild(label);
    });

    toggleButton.addEventListener("click", () => {
      const isOpen = !this.panel.hidden;

      this.panel.hidden = isOpen;
      toggleButton.setAttribute("aria-expanded", String(!isOpen));
    });

    this.container.appendChild(toggleButton);
    this.container.appendChild(this.panel);

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