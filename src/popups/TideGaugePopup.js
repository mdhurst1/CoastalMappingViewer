/*
 * Tide gauge popup
 * --------------------------------------------------------------------------
 * Creates the popup content displayed when a tide gauge is selected.
 */

import {appendPopupField, createPopupContainer} from "./PopupContent.js";

export function createTideGaugePopup(properties) {

    const popup = createPopupContainer(
        "tide-gauge-popup",
        properties.Station_ID ?? "Tide gauge",
    );
    
    appendPopupField(
        popup,
        "Organisation",
        properties.Organisation
    );

    return popup;
}