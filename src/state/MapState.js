import { getFutureState } from "../state/ApplicationState.js";

import {
    FUTURE_DATASETS,
    FUTURE_UNCERTAINTY_DATASETS,
    getFutureShorelineDataset,
    getFutureUncertaintyDataset,
} from "../config/DatasetConfig.js";

import {
    updateFutureMHWS,
    updateFutureMHWSStyle,
    setFutureMHWSVisibility,
} from "../layers/FutureMHWS.js";

import {
    updateFutureUncertainty,
    updateFutureUncertaintyStyle,
    setFutureUncertaintyVisibility,
} from "../layers/FutureMHWSUncertainty.js";

export function applyFutureState(map) {
    const futureState = getFutureState();
    const visible = futureState.scenario !== "None";

    setFutureMHWSVisibility(
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
        updateFutureMHWS(
            map,
            FUTURE_DATASETS[0],
            selectedFutureDataset,
            futureState.year,
        );

        updateFutureMHWSStyle(
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