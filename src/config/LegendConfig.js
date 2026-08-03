// initiate legend items
const LEGEND_ITEMS = [
  {
    group: "mhws",
    type: "gradient",
    title: "MHWS shorelines",
    colours: MHWS_COLOURS,
  },
  {
    group: "vegetation",
    type: "gradient",
    title: "Vegetation edge",
    colours: VEDGE_COLOURS,
  },
  {
    group: "transects",
    type: "gradient",
    title: "Historical shoreline change (m/yr)",
    colours: TRANSECT_COLOURS,
    leftLabel: "Erosion",
    rightLabel: "Accretion",
    units: "m/yr",
  },
];