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
  const mapRect =
    map.getContainer().getBoundingClientRect();

  const popupElement = popup.getElement();

  if (!popupElement) {
    return;
  }

  const popupRect =
    popupElement.getBoundingClientRect();

  let movePopupX = 0;
  let movePopupY = 0;

  /*
   * Keep the popup inside the map viewport.
   */
  if (popupRect.left < mapRect.left + padding) {
    movePopupX =
      mapRect.left + padding - popupRect.left;
  } else if (
    popupRect.right >
    mapRect.right - padding
  ) {
    movePopupX =
      mapRect.right - padding - popupRect.right;
  }

  if (popupRect.top < mapRect.top + padding) {
    movePopupY =
      mapRect.top + padding - popupRect.top;
  } else if (
    popupRect.bottom >
    mapRect.bottom - padding
  ) {
    movePopupY =
      mapRect.bottom - padding - popupRect.bottom;
  }

  /*
   * Keep the popup clear of the legend.
   */
  const legend =
    map.getContainer().querySelector(".legend-control");

  if (legend) {
    const legendRect =
      legend.getBoundingClientRect();

    if (
      rectanglesOverlap(
        popupRect,
        legendRect,
        padding,
      )
    ) {
      /*
       * Move the popup away from whichever side of the legend
       * requires the smallest displacement.
       */
      const moveLeft =
        legendRect.left -
        padding -
        popupRect.right;

      const moveRight =
        legendRect.right +
        padding -
        popupRect.left;

      const moveUp =
        legendRect.top -
        padding -
        popupRect.bottom;

      const moveDown =
        legendRect.bottom +
        padding -
        popupRect.top;

      const candidates = [
        {
          axis: "x",
          value: moveLeft,
          distance: Math.abs(moveLeft),
        },
        {
          axis: "x",
          value: moveRight,
          distance: Math.abs(moveRight),
        },
        {
          axis: "y",
          value: moveUp,
          distance: Math.abs(moveUp),
        },
        {
          axis: "y",
          value: moveDown,
          distance: Math.abs(moveDown),
        },
      ];

      candidates.sort(
        (a, b) => a.distance - b.distance,
      );

      const smallestMove = candidates[0];

      if (smallestMove.axis === "x") {
        movePopupX += smallestMove.value;
      } else {
        movePopupY += smallestMove.value;
      }
    }
  }

  if (movePopupX !== 0 || movePopupY !== 0) {
    map.panBy(
      [-movePopupX, -movePopupY],
      {
        duration: 300,
      },
    );
  }
}

function observePopupSize(map, popup) {
  const popupElement = popup.getElement();

  if (!popupElement) {
    return;
  }

  const observer = new ResizeObserver(() => {
    keepPopupInView(map, popup);
  });

  observer.observe(popupElement);

  popup.on("close", () => {
    observer.disconnect();
  });
}

function rectanglesOverlap(a, b, padding = 8) {
  return !(
    a.right < b.left - padding ||
    a.left > b.right + padding ||
    a.bottom < b.top - padding ||
    a.top > b.bottom + padding
  );
}