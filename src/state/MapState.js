import { getFutureState } from "../state/ApplicationState.js";

import {
    FUTURE_DATASETS,
    FUTURE_UNCERTAINTY_DATASETS,
    getFutureShorelineDataset,
    getFutureUncertaintyDataset,
} from "../config/DatasetConfig.js";

import {
    updateFutureShoreline,
    updateFutureShorelineStyle,
    setFutureShorelineVisibility,
} from "../layers/FutureShorelines.js";

import {
    updateFutureUncertainty,
    updateFutureUncertaintyStyle,
    setFutureUncertaintyVisibility,
} from "../layers/FutureShorelinesUncertainty.js";

export function applyFutureState(map) {
    const futureState = getFutureState();
    const visible = futureState.scenario !== "None";

    setFutureShorelineVisibility(
        map,
        FUTURE_DATASETS[0],
        visible,
    );

    setFutureUncertaintyVisibility(
        map,
        FUTURE_UNCERTAINTY_DATASETS[0],
        visible,
    );

    if (!visible) {
        return;
    }

    const selectedFutureDataset =
        getFutureShorelineDataset(futureState);

    if (selectedFutureDataset) {
        updateFutureShoreline(
            map,
            FUTURE_DATASETS[0],
            selectedFutureDataset,
            futureState.year,
        );

        updateFutureShorelineStyle(
            map,
            FUTURE_DATASETS[0],
            futureState.scenario,
        );
    }

    const selectedUncertaintyDataset =
        getFutureUncertaintyDataset(futureState);

    if (selectedUncertaintyDataset) {
        updateFutureUncertainty(
            map,
            FUTURE_UNCERTAINTY_DATASETS[0],
            selectedUncertaintyDataset,
        );

        updateFutureUncertaintyStyle(
            map,
            FUTURE_UNCERTAINTY_DATASETS[0],
            futureState.scenario,
        );
    }
}