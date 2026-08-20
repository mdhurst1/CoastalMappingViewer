
/*
 * Colour Ramp
 * --------------------------------------------------------------------------
 * Utilities for creating continuous colour ramps.
 *
 * MDH, August 2026
 * --------------------------------------------------------------------------
 */

export function interpolateColourRamp(stops) {

    const keys = Object.keys(stops)
        .map(Number)
        .sort((a, b) => a - b);

    const colormap = {};

    for (let i = 0; i < keys.length - 1; i++) {

        const start = keys[i];
        const end = keys[i + 1];

        const startRGB = hexToRGB(stops[start]);
        const endRGB = hexToRGB(stops[end]);

        for (let value = start; value <= end; value++) {

            const t = (value - start) / (end - start);

            const r = Math.round(
                startRGB.r + t * (endRGB.r - startRGB.r)
            );

            const g = Math.round(
                startRGB.g + t * (endRGB.g - startRGB.g)
            );

            const b = Math.round(
                startRGB.b + t * (endRGB.b - startRGB.b)
            );

            colormap[value] =
                `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
    }

    return colormap;
}

function hexToRGB(hex) {
    const value = parseInt(hex.slice(1), 16);

    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
}

function toHex(value) {
    return value.toString(16).padStart(2, "0");
}