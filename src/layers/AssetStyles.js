/*
 * Asset layer styles
 * --------------------------------------------------------------------------
 * Contains MapLibre paint and layout definitions for OpenStreetMap assets.
 *
 * Keeping styles separate from Assets.js makes it easier to adjust the
 * appearance of buildings, roads and railways without changing the layer
 * creation logic.
 */

export const BuildingFillStyle = {
  minzoom: 13,

  layout: {
    visibility: "none",
  },

  paint: {
    "fill-color": "#777777",

    "fill-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      13, 0.12,
      15, 0.22,
      17, 0.32,
      19, 0.42,
    ],
  },
};

export const BuildingOutlineStyle = {
  minzoom: 14,

  layout: {
    visibility: "none",
  },

  paint: {
    "line-color": "#555555",

    "line-width": [
      "interpolate",
      ["linear"],
      ["zoom"],
      14, 0.25,
      17, 0.6,
      19, 1.0,
    ],

    "line-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      14, 0.25,
      17, 0.55,
      19, 0.75,
    ],
  },
};

/*
 * Road styling
 * --------------------------------------------------------------------------
 * Roads become slightly wider and more opaque as the user zooms in.
 */

export const RoadStyle = {
    minzoom: 8,

    layout: {
        visibility: "none",
        "line-cap": "round",
        "line-join": "round",
    },

    paint: {
        "line-color": [
            "match",
            ["get", "class"],

            // Major roads
            "motorway", "#d98989",
            "trunk", "#d9a16f",
            "primary", "#d9b56f",

            // Other roads
            "secondary", "#c8c1a8",
            "tertiary", "#c8c1a8",
            "minor", "#b8b8b8",
            "service", "#aaaaaa",

            // Default
            "#b8b8b8",
        ],

        "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],

            8, [
                "match",
                ["get", "class"],
                "motorway", 1.5,
                "trunk", 1.2,
                "primary", 1.0,
                0.5,
            ],

            14, [
                "match",
                ["get", "class"],
                "motorway", 6,
                "trunk", 5,
                "primary", 4,
                "secondary", 3,
                "tertiary", 2.5,
                1.5,
            ],

            22, [
                "match",
                ["get", "class"],
                "motorway", 24,
                "trunk", 22,
                "primary", 20,
                "secondary", 18,
                "tertiary", 16,
                "minor", 14,
                "service", 14,
                14,
            ],
        ],

        "line-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8, 0.45,
            12, 0.65,
            16, 0.85,
        ],
    },
};

/*
 * Railway styling
 * --------------------------------------------------------------------------
 * Railways use a dark dashed line so they remain distinct from roads.
 */

export const RailwayStyle = {
    minzoom: 8,

    layout: {
        visibility: "none",
        "line-cap": "butt",
        "line-join": "round",
    },

    paint: {
        "line-color": "#555555",

        "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8, 0.7,
            12, 1.2,
            16, 2.5,
        ],

        "line-dasharray": [3, 2],

        "line-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8, 0.5,
            12, 0.7,
            16, 0.9,
        ],
    },
};