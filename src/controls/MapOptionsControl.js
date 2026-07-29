/*
 * MapOptionsControl
 * --------------------------------------------------------------------------
 * Combined MapLibre control for switching basemaps and toggling data layers.
 */

const ASSET_LAYERS = [
  { value: "buildings", label: "Buildings" },
  { value: "roads", label: "Roads" },
  { value: "railways", label: "Railways" },
];

const FUTURE_SCENARIOS = [
  { value: "None", label: "None" },
  { value: "RCP26", label: "RCP 2.6" },
  { value: "RCP45", label: "RCP 4.5" },
  { value: "RCP85", label: "RCP 8.5" },
];

const FUTURE_INDICATORS = [
  { value: "MHWS", label: "Mean High Water Springs" },
  { value: "VEdge", label: "Vegetation edge" },
];

const FUTURE_YEARS = [
  2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100,
];

export default class MapOptionsControl {

  constructor(basemaps, initialBasemap, layerGroups, onAssetVisibilityChanged, onLayerVisibilityChanged, onFutureShorelineChanged)
  {
    // initialise
    this.basemaps = basemaps;
    this.activeBasemap = initialBasemap;
    this.layerGroups = layerGroups;
    this.onAssetVisibilityChanged = onAssetVisibilityChanged;
    this.onLayerVisibilityChanged = onLayerVisibilityChanged;
    this.onFutureShorelineChanged = onFutureShorelineChanged;
    
    this.futureShorelineState = {
      scenario: "None",
      indicator: "MHWS",
      year: 2030,
    };
    this.assetLayerState = {
      buildings: false,
      roads: false,
      railways: false,
    };
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

    // create basemap button
    const BasemapButton = this.createButton(
      "Choose basemap",
      this.getBasemapIcon(),
      () => this.showBasemapPanel(),
    );

    // create assets button
    const AssetButton = this.createButton(
      "Choose visible assets",
      this.getAssetIcon(),
      () => this.showAssetPanel(),
    );

    const LayerButton = this.createButton(
      "Choose visible layers",
      this.getLayerIcon(),
      () => this.showLayerPanel(),
    );

    const FutureShorelinesButton = this.createButton(
      "Select future shorelines",
      this.getFutureIcon(),
      () => this.showFuturePanel(),
    )

    buttonRow.appendChild(BasemapButton);
    buttonRow.appendChild(AssetButton);
    buttonRow.appendChild(LayerButton);
    buttonRow.appendChild(FutureShorelinesButton);

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

  showAssetPanel() {
    const isAlreadyOpen =
      !this.panel.hidden &&
      this.panel.dataset.panel === "assets";

    if (isAlreadyOpen) {
      this.panel.hidden = true;
      return;
    }

    this.panel.dataset.panel = "assets";
    this.panel.replaceChildren();

    const title = document.createElement("div");
    title.className = "map-options-title";
    title.textContent = "Assets";

    this.panel.appendChild(title);

    ASSET_LAYERS.forEach((assetLayer) => {
      const label = document.createElement("label");
      label.className = "map-options-option";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = assetLayer.value;
      input.checked =
        this.assetLayerState[assetLayer.value];

      input.addEventListener("change", () => {
        this.assetLayerState[assetLayer.value] =
          input.checked;

        this.notifyAssetVisibilityChanged();
      });

      label.appendChild(input);
      label.append(` ${assetLayer.label}`);

      this.panel.appendChild(label);
    });

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
          this.onLayerVisibilityChanged();
        });

        label.appendChild(input);
        label.append(` ${group.name}`);

        this.panel.appendChild(label);
      },
    );

    this.panel.hidden = false;
  }

  showFuturePanel() {
    const isAlreadyOpen =
      !this.panel.hidden &&
      this.panel.dataset.panel === "future-shorelines";

    if (isAlreadyOpen) {
      this.panel.hidden = true;
      return;
    }

    this.panel.dataset.panel = "future-shorelines";
    this.panel.replaceChildren();

    const title = document.createElement("div");
    title.className = "map-options-title";
    title.textContent = "Future shorelines";

    /*
    * Scenario dropdown
    */

    const scenarioLabel = document.createElement("label");
    scenarioLabel.className = "future-control-label";
    scenarioLabel.htmlFor = "future-scenario-select";
    scenarioLabel.textContent = "Scenario";

    const scenarioSelect = document.createElement("select");
    scenarioSelect.id = "future-scenario-select";
    scenarioSelect.className = "future-control-select";

    FUTURE_SCENARIOS.forEach((scenario) => {
      const option = document.createElement("option");

      option.value = scenario.value;
      option.textContent = scenario.label;

      scenarioSelect.appendChild(option);
    });

    scenarioSelect.value =
      this.futureShorelineState.scenario;

    scenarioSelect.addEventListener("change", () => {
      this.futureShorelineState.scenario =
        scenarioSelect.value;
        this.notifyFutureChanged();

    });

    /*
    * Shoreline indicator dropdown
    */

    const indicatorLabel = document.createElement("label");
    indicatorLabel.className = "future-control-label";
    indicatorLabel.htmlFor = "future-indicator-select";
    indicatorLabel.textContent = "Indicator";

    const indicatorSelect = document.createElement("select");
    indicatorSelect.id = "future-indicator-select";
    indicatorSelect.className = "future-control-select";

    FUTURE_INDICATORS.forEach((indicator) => {
      const option = document.createElement("option");

      option.value = indicator.value;
      option.textContent = indicator.label;

      indicatorSelect.appendChild(option);
    });

    indicatorSelect.value =
      this.futureShorelineState.indicator;

    indicatorSelect.addEventListener("change", () => {
      this.futureShorelineState.indicator =
        indicatorSelect.value;
        this.notifyFutureChanged();
    });

    /*
    * Year slider
    */

    const yearLabel = document.createElement("label");
    yearLabel.className = "future-control-label";
    yearLabel.htmlFor = "future-year-slider";
    yearLabel.textContent =
      `Year: ${this.futureShorelineState.year}`;

    const yearSlider = document.createElement("input");
    yearSlider.type = "range";
    yearSlider.id = "future-year-slider";
    yearSlider.className = "future-year-slider";

    yearSlider.min = 0;
    yearSlider.max = FUTURE_YEARS.length - 1;
    yearSlider.step = 1;

    const selectedYearIndex = FUTURE_YEARS.indexOf(
      this.futureShorelineState.year,
    );

    yearSlider.value =
      selectedYearIndex === -1 ? 0 : selectedYearIndex;

    yearSlider.addEventListener("input", () => {
      const yearIndex = Number(yearSlider.value);
      const selectedYear = FUTURE_YEARS[yearIndex];

      this.futureShorelineState.year = selectedYear;
      yearLabel.textContent = `Year: ${selectedYear}`;
      
      this.notifyFutureChanged();
    });

    const tickContainer = document.createElement("div");
    tickContainer.className = "future-slider-ticks";

    FUTURE_YEARS.forEach((year, index) => {
        const tick = document.createElement("div");
        tick.className = "future-slider-tick";
        tick.style.left = `${100 * index / (FUTURE_YEARS.length - 1)}%`;

        // Only label selected years
        if (year === 2030 || year === 2050 || year === 2100) {
            const label = document.createElement("span");
            label.textContent = year;
            tick.appendChild(label);
        }

        tickContainer.appendChild(tick);
    });
    /*
    * Add controls to panel
    */

    // add the title
    this.panel.appendChild(title);

    // create the row
    const dropdownRow = document.createElement("div");
    dropdownRow.className = "future-dropdown-row";

    // create scenario column
    const scenarioColumn = document.createElement("div");
    scenarioColumn.className = "future-dropdown-column";

    scenarioColumn.appendChild(scenarioLabel);
    scenarioColumn.appendChild(scenarioSelect);

    // create the indicator column
    const indicatorColumn = document.createElement("div");
    indicatorColumn.className = "future-dropdown-column";

    indicatorColumn.appendChild(indicatorLabel);
    indicatorColumn.appendChild(indicatorSelect);

    // add both columns to row
    dropdownRow.appendChild(scenarioColumn);
    dropdownRow.appendChild(indicatorColumn);
    this.panel.appendChild(dropdownRow);

    this.panel.appendChild(yearLabel);
    this.panel.appendChild(yearSlider);
    this.panel.appendChild(tickContainer);
    
    this.panel.hidden = false;
  }

  // function to keep track of state of future panel
  notifyFutureChanged() {
      this.onFutureShorelineChanged?.({
          ...this.futureShorelineState,
      });
  }

  /*
 * Notify the application when an asset checkbox changes.
 */

  notifyAssetVisibilityChanged() {
    if (this.onAssetVisibilityChanged) {
      this.onAssetVisibilityChanged({
        ...this.assetLayerState,
      });
    }
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

  getAssetIcon() {
    return `
      <svg
        class="map-options-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M4 20V9l6-3v14"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M10 20V4l10 4v12"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M2 20h20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
        <path
          d="M13 8h1M17 10h1M13 12h1M17 14h1M13 16h1"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
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

getFutureIcon() {
  return `
    <svg
      class="map-options-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      />
      <path
        d="M12 12V8"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M12 12L15 14"
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