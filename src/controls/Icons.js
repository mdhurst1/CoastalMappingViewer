/*
 * Map options control icons
 * --------------------------------------------------------------------------
 * SVG markup used by MapOptionsControl.
 *
 * All icons use a consistent 24 × 24 viewbox, rounded strokes, and matching
 * line weights so they appear as a coherent visual set.
 *
 * MDH, August 2026
 */

const SVG_START = `
  <svg
    class="map-options-icon"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
`;

const SVG_END = `
  </svg>
`;

export const MAP_OPTIONS_ICONS = {
  /*
   * Basemap
   * ------------------------------------------------------------------------
   * Folded map with three connected panels.
   */
  basemap: `
    ${SVG_START}
      <path
        d="M3.5 5.5L8.5 3.5L15.5 6L20.5 4V18.5L15.5 20.5L8.5 18L3.5 20V5.5Z"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.5 3.5V18"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M15.5 6V20.5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    ${SVG_END}
  `,

  /*
   * Assets
   * ------------------------------------------------------------------------
   * Built environment represented by buildings and a road.
   */
  assets: `
    ${SVG_START}
      <path
        d="M4 19V10H10V19"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10 19V6H16V19"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M16 19V12H20V19"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M2.5 19H21.5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M6.5 13H7.5M6.5 16H7.5M12.5 9H13.5M12.5 12H13.5M12.5 15H13.5"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    ${SVG_END}
  `,

  /*
   * Marine
   * ------------------------------------------------------------------------
   * Navigation buoy above two wave lines.
   */
  marine: `
    ${SVG_START}
      <path
        d="M12 4V9"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M9.5 9L12 6.5L14.5 9"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        cx="12"
        cy="3.5"
        r="1.4"
        fill="currentColor"
      />
      <path
        d="M2.5 11.5C4.2 10.1 5.9 10.1 7.6 11.5C9.3 12.9 11 12.9 12.7 11.5C14.4 10.1 16.1 10.1 17.8 11.5C19.5 12.9 20.5 12.9 21.5 12"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M2.5 16C4.2 14.6 5.9 14.6 7.6 16C9.3 17.4 11 17.4 12.7 16C14.4 14.6 16.1 14.6 17.8 16C19.5 17.4 20.5 17.4 21.5 16.5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M9.5 20H14.5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    ${SVG_END}
  `,

  /*
   * Raster layers icon
   * ------------------------------------------------------------------------
   */

  raster: `
    ${SVG_START}
      <path
        d="M4 4H20V20H4Z"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
      <path
        d="M9.3 4V20M14.7 4V20M4 9.3H20M4 14.7H20"
        stroke="currentColor"
        stroke-width="1.2"
      />
      <path
        d="M4 16L8 12L11 14L15 9L20 13"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    ${SVG_END}
  `,

  /*
   * Coastal layers
   * ------------------------------------------------------------------------
   * Stylised shoreline crossed by coastal transects.
   */
  layers: `
    ${SVG_START}
      <path
        d="M3 7C5.2 5.5 7.2 5.6 9.2 7C11.2 8.4 13.1 8.4 15.1 7C17.1 5.6 19.2 5.6 21 7"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M4 17.5H20"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M6 9.5L6 16M10 10L10 16M14 10L14 16M18 9.5L18 16"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <circle
        cx="6"
        cy="17.5"
        r="1"
        fill="currentColor"
      />
      <circle
        cx="10"
        cy="17.5"
        r="1"
        fill="currentColor"
      />
      <circle
        cx="14"
        cy="17.5"
        r="1"
        fill="currentColor"
      />
      <circle
        cx="18"
        cy="17.5"
        r="1"
        fill="currentColor"
      />
    ${SVG_END}
  `,

  /*
   * Future shoreline
   * ------------------------------------------------------------------------
   * Present shoreline, predicted shoreline, and direction of change.
   */
  future: `
    ${SVG_START}
      <path
        d="M3 7C5 5.7 7 5.7 9 7C11 8.3 13 8.3 15 7C17 5.7 19 5.7 21 7"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M3 17C5 15.7 7 15.7 9 17C11 18.3 13 18.3 15 17C17 15.7 19 15.7 21 17"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-dasharray="2.4 2.4"
      />
      <path
        d="M12 10V14"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M9.8 12.2L12 14.4L14.2 12.2"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    ${SVG_END}
  `,
};