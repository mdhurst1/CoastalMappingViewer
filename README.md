# CoastalMappingViewer
Experimenting with approaches to coastal data visualisation using interactive webmaps

## Layer architecture

Interactive GeoJSON line layers use shared helpers in `src/layers`:

- `LineLayer.js` adds sources, line layers, highlight halos and visibility.
- `LineInteractions.js` manages hover, selection and popup lifecycle.
- `PopupContent.js` creates safe DOM-based popup fields.
- `Popup.css` provides shared popup styling.
- `MHWS.js`, `VEdge.js` and `Transects.js` contain only dataset-specific paint and popup definitions, while preserving their original exported functions.

To add another interactive line dataset, create a small dataset-specific module that calls `addGeoJsonLineLayers()` and `registerLineInteractions()`, then add its functions to a group in `LAYER_GROUPS` in `main.js`.
