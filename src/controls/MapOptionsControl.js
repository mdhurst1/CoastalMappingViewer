/*
 * MapOptionsControl
 * --------------------------------------------------------------------------
 * Combined MapLibre control for switching basemaps and toggling data layers.
 */

// Import SVG icons for the control buttons
import { MAP_OPTIONS_ICONS } from "./Icons.js";


/*
 * Control options
 * --------------------------------------------------------------------------
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
  2030,
  2040,
  2050,
  2060,
  2070,
  2080,
  2090,
  2100,
];


/*
 * Map options control
 * --------------------------------------------------------------------------
 */

export default class MapOptionsControl {

  constructor(
    basemaps,
    initialBasemap,
    layerGroups,
    initialAssetState,
    initialMarineState,
    initialRasterState,
    initialFutureState,
    onAssetVisibilityChanged,
    onMarineVisibilityChanged,
    onRasterVisibilityChanged,
    onLayerVisibilityChanged,
    onFutureShorelineChanged,
  ) {
    // Configuration
    this.basemaps = basemaps;
    this.activeBasemap = initialBasemap;
    this.layerGroups = layerGroups;

    // Application callbacks
    this.onAssetVisibilityChanged =
      onAssetVisibilityChanged;

    this.onMarineVisibilityChanged =
      onMarineVisibilityChanged;

    this.onRasterVisibilityChanged =
      onRasterVisibilityChanged;

    this.onLayerVisibilityChanged =
      onLayerVisibilityChanged;

    this.onFutureShorelineChanged =
      onFutureShorelineChanged;

    // Local copies of application state
    this.assetLayerState = {
      ...initialAssetState,
    };

    this.marineLayerState = {
      ...initialMarineState,
    };

    this.rasterLayerState = {
      ...initialRasterState,
    };

    this.futureShorelineState = {
      ...initialFutureState,
    };

    // MapLibre control elements
    this.map = undefined;
    this.container = undefined;
    this.panel = undefined;
  }


  /*
   * Add control to map
   * ------------------------------------------------------------------------
   */

  onAdd(map) {
    this.map = map;

    // Outer control container
    this.container = document.createElement("div");
    this.container.className =
      "maplibregl-ctrl map-options-control";

    // Horizontal row containing the icon buttons
    const buttonRow = document.createElement("div");
    buttonRow.className = "map-options-buttons";

    // Basemap button
    const basemapButton = this.createButton(
      "Choose basemap",
      MAP_OPTIONS_ICONS.basemap,
      () => this.showBasemapPanel(),
    );

    // Asset button
    const assetButton = this.createButton(
      "Choose visible assets",
      MAP_OPTIONS_ICONS.assets,
      () => this.showAssetPanel(),
    );

    // Marine-data button
    const marineButton = this.createButton(
      "Choose marine data",
      MAP_OPTIONS_ICONS.marine,
      () => this.showMarinePanel(),
    );

    // Raster-layer button
    const rasterButton = this.createButton(
      "Choose raster layers",
      MAP_OPTIONS_ICONS.raster,
      () => this.showRasterPanel(),
    );

    // Coastal-layer button
    const coastalLayerButton = this.createButton(
      "Choose visible layers",
      MAP_OPTIONS_ICONS.layers,
      () => this.showLayerPanel(),
    );

    // Future-shoreline button
    const futureShorelinesButton =
      this.createButton(
        "Select future shorelines",
        MAP_OPTIONS_ICONS.future,
        () => this.showFuturePanel(),
      );

    buttonRow.appendChild(basemapButton);
    buttonRow.appendChild(assetButton);
    buttonRow.appendChild(marineButton);
    buttonRow.appendChild(rasterButton);
    buttonRow.appendChild(coastalLayerButton);
    buttonRow.appendChild(futureShorelinesButton);

    // Dropdown panel displayed beneath the icon buttons
    this.panel = document.createElement("div");
    this.panel.className = "map-options-panel";
    this.panel.hidden = true;

    this.container.appendChild(buttonRow);
    this.container.appendChild(this.panel);

    return this.container;
  }


  /*
   * Reusable control builders
   * ------------------------------------------------------------------------
   */

  /**
   * Create an icon button.
   *
   * @param {string} title - Button title and accessible label.
   * @param {string} icon - SVG markup displayed inside the button.
   * @param {Function} clickHandler - Function called when clicked.
   * @returns {HTMLButtonElement}
   */
  createButton(
    title,
    icon,
    clickHandler,
  ) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "map-options-button";
    button.title = title;
    button.setAttribute("aria-label", title);
    button.innerHTML = icon;

    button.addEventListener(
      "click",
      clickHandler,
    );

    return button;
  }


  /**
   * Create a labelled checkbox.
   *
   * This method is used by the asset, marine, and coastal-layer panels.
   * It creates only the user-interface element; the supplied callback
   * determines what application state should change.
   *
   * @param {string} labelText - Text shown beside the checkbox.
   * @param {boolean} checked - Initial checkbox state.
   * @param {Function} onChange - Receives the new checked value.
   * @returns {HTMLLabelElement}
   */
  createCheckbox(
    labelText,
    checked,
    onChange,
  ) {
    const label = document.createElement("label");
    label.className = "map-options-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;

    const text = document.createElement("span");
    text.textContent = labelText;

    input.addEventListener("change", () => {
      onChange(input.checked);
    });

    label.appendChild(input);
    label.appendChild(text);

    return label;
  }


  /*
   * Basemap panel
   * ------------------------------------------------------------------------
   */

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
        const label =
          document.createElement("label");

        label.className = "map-options-option";

        const input =
          document.createElement("input");

        input.type = "radio";
        input.name = "basemap";
        input.value = basemapId;
        input.checked =
          basemapId === this.activeBasemap;

        input.addEventListener("change", () => {
          if (!input.checked) {
            return;
          }

          this.activeBasemap = basemapId;
          this.map.setStyle(basemap.style);
        });

        const text =
          document.createElement("span");

        text.textContent = basemap.name;

        label.appendChild(input);
        label.appendChild(text);

        this.panel.appendChild(label);
      },
    );

    this.panel.hidden = false;
  }


  /*
   * Asset panel
   * ------------------------------------------------------------------------
   */

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
      const checkbox = this.createCheckbox(
        assetLayer.label,
        this.assetLayerState[assetLayer.value],
        (checked) => {
          this.assetLayerState[assetLayer.value] =
            checked;

          this.notifyAssetVisibilityChanged();
        },
      );

      this.panel.appendChild(checkbox);
    });

    this.panel.hidden = false;
  }


  /*
   * Marine panel
   * ------------------------------------------------------------------------
   */

  showMarinePanel() {
    const isAlreadyOpen =
      !this.panel.hidden &&
      this.panel.dataset.panel === "marine";

    if (isAlreadyOpen) {
      this.panel.hidden = true;
      return;
    }

    this.panel.dataset.panel = "marine";
    this.panel.replaceChildren();

    const title = document.createElement("div");
    title.className = "map-options-title";
    title.textContent = "Marine data";

    this.panel.appendChild(title);

    const tideGaugeOption = this.createCheckbox(
      "Tide gauges",
      this.marineLayerState.tideGauges,
      (checked) => {
        this.marineLayerState.tideGauges =
          checked;

        this.notifyMarineVisibilityChanged();
      },
    );

    this.panel.appendChild(tideGaugeOption);

    this.panel.hidden = false;
  }


  /*
   * Raster layer panel
   * ------------------------------------------------------------------------
   */

  showRasterPanel() {
  const isAlreadyOpen =
    !this.panel.hidden &&
    this.panel.dataset.panel === "raster";

  if (isAlreadyOpen) {
    this.panel.hidden = true;
    return;
  }

  this.panel.dataset.panel = "raster";
  this.panel.replaceChildren();

  const title = document.createElement("div");
  title.className = "map-options-title";
  title.textContent = "Raster layers";

  this.panel.appendChild(title);

  const lidarOption = this.createCheckbox(
    "LiDAR DTM",
    this.rasterLayerState.lidarDTM,
    (checked) => {
      this.rasterLayerState.lidarDTM =
        checked;

      this.notifyRasterVisibilityChanged();
    },
  );

  this.panel.appendChild(lidarOption);

  this.panel.hidden = false;
}


  /*
   * Coastal-layer panel
   * ------------------------------------------------------------------------
   */

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
        const checkbox = this.createCheckbox(
          group.name,
          group.visible,
          (checked) => {
            group.visible = checked;

            this.onLayerVisibilityChanged?.(
              groupId,
              checked,
            );
          },
        );

        this.panel.appendChild(checkbox);
      },
    );

    this.panel.hidden = false;
  }


  /*
   * Future-shoreline panel
   * ------------------------------------------------------------------------
   */

  showFuturePanel() {
    const isAlreadyOpen =
      !this.panel.hidden &&
      this.panel.dataset.panel ===
        "future-shorelines";

    if (isAlreadyOpen) {
      this.panel.hidden = true;
      return;
    }

    this.panel.dataset.panel =
      "future-shorelines";

    this.panel.replaceChildren();

    const title = document.createElement("div");
    title.className = "map-options-title";
    title.textContent = "Future shorelines";


    /*
     * Scenario dropdown
     * ----------------------------------------------------------------------
     */

    const scenarioLabel =
      document.createElement("label");

    scenarioLabel.className =
      "future-control-label";

    scenarioLabel.htmlFor =
      "future-scenario-select";

    scenarioLabel.textContent = "Scenario";

    const scenarioSelect =
      document.createElement("select");

    scenarioSelect.id =
      "future-scenario-select";

    scenarioSelect.className =
      "future-control-select";

    FUTURE_SCENARIOS.forEach((scenario) => {
      const option =
        document.createElement("option");

      option.value = scenario.value;
      option.textContent = scenario.label;

      scenarioSelect.appendChild(option);
    });

    scenarioSelect.value =
      this.futureShorelineState.scenario;

    scenarioSelect.addEventListener(
      "change",
      () => {
        this.futureShorelineState.scenario =
          scenarioSelect.value;

        this.notifyFutureChanged();
      },
    );


    /*
     * Shoreline-indicator dropdown
     * ----------------------------------------------------------------------
     */

    const indicatorLabel =
      document.createElement("label");

    indicatorLabel.className =
      "future-control-label";

    indicatorLabel.htmlFor =
      "future-indicator-select";

    indicatorLabel.textContent = "Indicator";

    const indicatorSelect =
      document.createElement("select");

    indicatorSelect.id =
      "future-indicator-select";

    indicatorSelect.className =
      "future-control-select";

    FUTURE_INDICATORS.forEach((indicator) => {
      const option =
        document.createElement("option");

      option.value = indicator.value;
      option.textContent = indicator.label;

      indicatorSelect.appendChild(option);
    });

    indicatorSelect.value =
      this.futureShorelineState.indicator;

    indicatorSelect.addEventListener(
      "change",
      () => {
        this.futureShorelineState.indicator =
          indicatorSelect.value;

        this.notifyFutureChanged();
      },
    );


    /*
     * Year slider
     * ----------------------------------------------------------------------
     */

    const yearLabel =
      document.createElement("label");

    yearLabel.className =
      "future-control-label";

    yearLabel.htmlFor =
      "future-year-slider";

    yearLabel.textContent =
      `Year: ${this.futureShorelineState.year}`;

    const yearSlider =
      document.createElement("input");

    yearSlider.type = "range";
    yearSlider.id = "future-year-slider";
    yearSlider.className =
      "future-year-slider";

    yearSlider.min = 0;
    yearSlider.max =
      FUTURE_YEARS.length - 1;

    yearSlider.step = 1;

    const selectedYearIndex =
      FUTURE_YEARS.indexOf(
        this.futureShorelineState.year,
      );

    yearSlider.value =
      selectedYearIndex === -1
        ? 0
        : selectedYearIndex;

    yearSlider.addEventListener(
      "input",
      () => {
        const yearIndex =
          Number(yearSlider.value);

        const selectedYear =
          FUTURE_YEARS[yearIndex];

        this.futureShorelineState.year =
          selectedYear;

        yearLabel.textContent =
          `Year: ${selectedYear}`;

        this.notifyFutureChanged();
      },
    );


    /*
     * Slider ticks
     * ----------------------------------------------------------------------
     */

    const tickContainer =
      document.createElement("div");

    tickContainer.className =
      "future-slider-ticks";

    FUTURE_YEARS.forEach((year, index) => {
      const tick =
        document.createElement("div");

      tick.className = "future-slider-tick";

      tick.style.left =
        `${100 * index /
        (FUTURE_YEARS.length - 1)}%`;

      // Only label selected years
      if (
        year === 2030 ||
        year === 2050 ||
        year === 2100
      ) {
        const label =
          document.createElement("span");

        label.textContent = year;
        tick.appendChild(label);
      }

      tickContainer.appendChild(tick);
    });


    /*
     * Add controls to panel
     * ----------------------------------------------------------------------
     */

    this.panel.appendChild(title);

    const dropdownRow =
      document.createElement("div");

    dropdownRow.className =
      "future-dropdown-row";

    const scenarioColumn =
      document.createElement("div");

    scenarioColumn.className =
      "future-dropdown-column";

    scenarioColumn.appendChild(
      scenarioLabel,
    );

    scenarioColumn.appendChild(
      scenarioSelect,
    );

    const indicatorColumn =
      document.createElement("div");

    indicatorColumn.className =
      "future-dropdown-column";

    indicatorColumn.appendChild(
      indicatorLabel,
    );

    indicatorColumn.appendChild(
      indicatorSelect,
    );

    dropdownRow.appendChild(
      scenarioColumn,
    );

    dropdownRow.appendChild(
      indicatorColumn,
    );

    this.panel.appendChild(dropdownRow);
    this.panel.appendChild(yearLabel);
    this.panel.appendChild(yearSlider);
    this.panel.appendChild(tickContainer);

    this.panel.hidden = false;
  }


  /*
   * State-change notifications
   * ------------------------------------------------------------------------
   */

  /**
   * Notify the application when the future-shoreline state changes.
   */
  notifyFutureChanged() {
    this.onFutureShorelineChanged?.({
      ...this.futureShorelineState,
    });
  }


  /**
   * Notify the application when an asset checkbox changes.
   */
  notifyAssetVisibilityChanged() {
    this.onAssetVisibilityChanged?.({
      ...this.assetLayerState,
    });
  }


  /**
   * Notify the application when a marine-data checkbox changes.
   */
  notifyMarineVisibilityChanged() {
    this.onMarineVisibilityChanged?.({
      ...this.marineLayerState,
    });
  }

  /**
 * Notify the application when a raster-layer checkbox changes.
 */
  notifyRasterVisibilityChanged() {
    this.onRasterVisibilityChanged?.({
      ...this.rasterLayerState,
    });
  }

  /*
   * Remove control from map
   * ------------------------------------------------------------------------
   */

  onRemove() {
    this.container?.remove();

    this.map = undefined;
    this.container = undefined;
    this.panel = undefined;
  }
}