/*
 * PopupContent
 * --------------------------------------------------------------------------
 * DOM-based popup helpers. Property values are appended as text, preventing
 * GeoJSON attributes from being interpreted as HTML.
 */

export function createPopupContainer(className, titleText) {
  const container = document.createElement("div");
  container.className = `coastal-popup ${className}`;

  const title = document.createElement("strong");
  title.textContent = titleText;
  container.appendChild(title);

  return container;
}

export function appendPopupField(
  container,
  label,
  value,
  { suffix = "", element = "p" } = {},
) {
  const row = document.createElement(element);
  const fieldLabel = document.createElement("strong");

  fieldLabel.textContent = `${label}: `;
  row.appendChild(fieldLabel);
  row.append(`${value ?? "Unknown"}${suffix}`);
  container.appendChild(row);

  return row;
}

export function appendTableRow(table, label, value, options = {}) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return;
  }

  const row = document.createElement("tr");

  const labelCell = document.createElement("th");
  labelCell.scope = "row";
  labelCell.textContent = label;

  const valueCell = document.createElement("td");
  valueCell.textContent =
    `${value}${options.suffix ?? ""}`;

  row.append(labelCell, valueCell);
  table.appendChild(row);
}