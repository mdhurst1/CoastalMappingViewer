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
        "Monitoring programme",
        properties.Monitoring_programme,
    );

    appendPopupField(
        popup,
        "Organisation",
        properties.Organisation,
    );

    appendPopupField(
        popup,
        "Start date",
        properties.Start_date,
    );

    appendPopupField(
        popup,
        "End date",
        properties.End_date,
    );

    appendPopupField(
        popup,
        "Sampling interval",
        properties.Frequency,
        { suffix: " minutes" },
    );

    appendPopupLink(
        popup,
        "Website",
        properties.URL,
        "View station",
    );

    return popup;
}