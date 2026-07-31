/*
 * LineInteractions
 * --------------------------------------------------------------------------
 * Shared hover, selection and popup behaviour for interactive line layers.
 */

function sameFeature(first, second) {
  return first?.source === second?.source && first?.id === second?.id;
}

function getFeatureReference(feature) {
  if (!feature || feature.id == null) {
    return null;
  }

  return {
    source: feature.source,
    id: feature.id,
  };
}

export function registerLineInteractions(
  map,
  datasets,
  PopupClass,
  createPopupContent,
) {
  let hoveredFeature = null;
  let selectedFeature = null;
  let activePopup = null;

  datasets.forEach((dataset) => {
    const layerId = `${dataset.id}-line`;

    map.on("mousemove", layerId, (event) => {
      const nextHoveredFeature = getFeatureReference(event.features?.[0]);

      if (!nextHoveredFeature) {
        return;
      }

      map.getCanvas().style.cursor = "crosshair";

      if (sameFeature(hoveredFeature, nextHoveredFeature)) {
        return;
      }

      if (hoveredFeature) {
        map.setFeatureState(hoveredFeature, { hover: false });
      }

      hoveredFeature = nextHoveredFeature;
      map.setFeatureState(hoveredFeature, { hover: true });
    });

    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";

      if (hoveredFeature) {
        map.setFeatureState(hoveredFeature, { hover: false });
        hoveredFeature = null;
      }
    });

    map.on("click", layerId, (event) => {
      const feature = event.features?.[0];
      const clickedFeature = getFeatureReference(feature);

      if (!clickedFeature) {
        return;
      }

      if (selectedFeature) {
        map.setFeatureState(selectedFeature, { selected: false });
      }

      const previousPopup = activePopup;
      activePopup = null;
      previousPopup?.remove();

      selectedFeature = clickedFeature;
      map.setFeatureState(clickedFeature, { selected: true });

      const popup = new PopupClass({ maxWidth: "750px" })
        .setLngLat(event.lngLat)
        .setDOMContent(createPopupContent(feature.properties ?? {}))
        .addTo(map);

      activePopup = popup;
      keepPopupInView(map, popup);

      popup.on("close", () => {
        if (sameFeature(selectedFeature, clickedFeature)) {
          map.setFeatureState(clickedFeature, { selected: false });
          selectedFeature = null;
        }

        if (activePopup === popup) {
          activePopup = null;
        }
      });
    });
  });
}

function keepPopupInView(map, popup, padding = 20) {
  requestAnimationFrame(() => {
    const mapRect =
      map.getContainer().getBoundingClientRect();

    const popupRect =
      popup.getElement().getBoundingClientRect();

    let dx = 0;
    let dy = 0;

    if (popupRect.left < mapRect.left + padding) {
      dx =
        popupRect.left -
        mapRect.left -
        padding;
    } else if (
      popupRect.right >
      mapRect.right - padding
    ) {
      dx =
        popupRect.right -
        mapRect.right +
        padding;
    }

    if (popupRect.top < mapRect.top + padding) {
      dy =
        popupRect.top -
        mapRect.top -
        padding;
    } else if (
      popupRect.bottom >
      mapRect.bottom - padding
    ) {
      dy =
        popupRect.bottom -
        mapRect.bottom +
        padding;
    }

    if (dx !== 0 || dy !== 0) {
      map.panBy([dx, dy], {
        duration: 300,
      });
    }
  });
}