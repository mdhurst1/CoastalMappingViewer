/*
 * Tide gauge popup
 * --------------------------------------------------------------------------
 * Creates the popup content displayed when a tide gauge is selected.
 */

import {appendTableRow, createPopupContainer} from "./PopupContent.js";

export function createTideGaugePopup(properties) {

    const popup = createPopupContainer(
        "tide-gauge-popup",
        properties.Station_ID ?? "Tide gauge",
    );

    const table = document.createElement("table");
    table.className = "tide-gauge-popup-table";

    appendTableRow(
        table,
        "Monitoring programme",
        properties.Monitoring_programme,
    );

    appendTableRow(
        table,
        "Organisation",
        properties.Organisation,
    );

    appendTableRow(
        table,
        "Start date",
        properties.Start_date,
    );

    appendTableRow(
        table,
        "End date",
        properties.End_date,
    );

    appendTableRow(
        table,
        "Sampling interval",
        properties.Frequency,
        { suffix: " minutes" },
    );

    appendTableRow(
        table,
        "Notes",
        properties.Notes,
    );

    popup.appendChild(table);

    const row = document.createElement("tr");

    const label = document.createElement("th");
    label.textContent = "Website";

    const value = document.createElement("td");

    const link = document.createElement("a");
    link.href = properties.URL;
    link.textContent = "Open station page ↗";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    value.appendChild(link);

    row.append(label, value);
    table.appendChild(row);

    return popup;
    }