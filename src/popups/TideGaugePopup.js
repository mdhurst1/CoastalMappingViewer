/*
 * Tide gauge popup
 * --------------------------------------------------------------------------
 * Creates the popup content displayed when a tide gauge is selected.
 */

import {appendPopupField, createPopupContainer} from "./PopupContent.js";

export function createTideGaugePopup(properties) {

    const popup = createPopupContainer(
        properties.Station_ID
    );

    appendPopupField(
        popup,
        "Organisation",
        properties.Organisation
    );

    appendPopupField(
        popup,
        "Frequency",
        properties.Frequency
    );

    return popup;
}