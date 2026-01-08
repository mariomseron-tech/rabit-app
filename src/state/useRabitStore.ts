import { DataPoint, RabitAnalysis, StepMetrics, StepWindow } from "../types/fit";

export interface RabitStoreState extends RabitAnalysis {
  lastUpdated: number;
}

export type RabitStoreListener = (state: RabitStoreState) => void;

const DEFAULT_METRICS: StepMetrics = {
  totalSteps: 0,
  averageCadence: 0,
  durationMs: 0,
};

const DEFAULT_STATE: RabitStoreState = {
  rawBuffer: [],
  normalized: [],
  detectedWindows: [],
  metrics: DEFAULT_METRICS,
  uiOverrides: {
    selectedWindowId: undefined,
    showRaw: true,
    showNormalized: true,
    showCadence: true,
  },
  flags: {
    isCollecting: false,
    hasEnoughData: false,
  },
  lastUpdated: 0,
};

const ONE_MINUTE_MS = 60_000;

const sliceLastMinute = <T extends DataPoint | StepWindow>(
  values: T[],
  now: number,
  getTime: (item: T) => number
): T[] => {
  const cutoff = now - ONE_MINUTE_MS;
  return values.filter((value) => getTime(value) >= cutoff);
};

const cloneState = (state: RabitStoreState): RabitStoreState => ({
  ...state,
  rawBuffer: [...state.rawBuffer],
  normalized: [...state.normalized],
  detectedWindows: [...state.detectedWindows],
  metrics: { ...state.metrics },
  uiOverrides: { ...state.uiOverrides },
  flags: { ...state.flags },
});

export interface RabitStore {
  getState(): RabitStoreState;
  setState(
    updater:
      | Partial<RabitStoreState>
      | ((state: RabitStoreState) => Partial<RabitStoreState>)
  ): void;
  subscribe(listener: RabitStoreListener): () => void;
  actions: {
    setRawBuffer(rawBuffer: DataPoint[]): void;
    setNormalized(normalized: DataPoint[]): void;
    setDetectedWindows(detectedWindows: StepWindow[]): void;
    setMetrics(metrics: StepMetrics): void;
    setFlags(flags: RabitStoreState["flags"]): void;
    updateUiOverrides(overrides: Partial<RabitStoreState["uiOverrides"]>): void;
    reset(): void;
  };
  selectors: {
    lastMinuteRaw(now?: number): DataPoint[];
    lastMinuteNormalized(now?: number): DataPoint[];
    lastMinuteWindows(now?: number): StepWindow[];
    flags(): RabitStoreState["flags"];
  };
}

export const createRabitStore = (
  initialState: RabitStoreState = DEFAULT_STATE
): RabitStore => {
  let state: RabitStoreState = cloneState(initialState);
  const listeners = new Set<RabitStoreListener>();

  const notify = () => {
    listeners.forEach((listener) => listener(cloneState(state)));
  };

  const getState = () => cloneState(state);

  const applyUpdate = (
    updater:
      | Partial<RabitStoreState>
      | ((current: RabitStoreState) => Partial<RabitStoreState>)
  ): void => {
    const partial =
      typeof updater === "function" ? updater(cloneState(state)) : updater;

    state = {
      ...state,
      ...partial,
      metrics: partial.metrics ? { ...partial.metrics } : state.metrics,
      rawBuffer: partial.rawBuffer
        ? [...partial.rawBuffer]
        : state.rawBuffer,
      normalized: partial.normalized
        ? [...partial.normalized]
        : state.normalized,
      detectedWindows: partial.detectedWindows
        ? [...partial.detectedWindows]
        : state.detectedWindows,
      uiOverrides: partial.uiOverrides
        ? { ...state.uiOverrides, ...partial.uiOverrides }
        : state.uiOverrides,
      flags: partial.flags ? { ...partial.flags } : state.flags,
      lastUpdated: Date.now(),
    };

    notify();
  };

  const setState = (
    updater:
      | Partial<RabitStoreState>
      | ((state: RabitStoreState) => Partial<RabitStoreState>)
  ) => applyUpdate(updater);

  const subscribe = (listener: RabitStoreListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const actions = {
    setRawBuffer(rawBuffer: DataPoint[]) {
      applyUpdate({ rawBuffer });
    },
    setNormalized(normalized: DataPoint[]) {
      applyUpdate({ normalized });
    },
    setDetectedWindows(detectedWindows: StepWindow[]) {
      applyUpdate({ detectedWindows });
    },
    setMetrics(metrics: StepMetrics) {
      applyUpdate({ metrics });
    },
    setFlags(flags: RabitStoreState["flags"]) {
      applyUpdate({ flags });
    },
    updateUiOverrides(overrides: Partial<RabitStoreState["uiOverrides"]>) {
      applyUpdate({ uiOverrides: { ...state.uiOverrides, ...overrides } });
    },
    reset() {
      state = cloneState(DEFAULT_STATE);
      notify();
    },
  };

  const selectors = {
    lastMinuteRaw(now: number = Date.now()) {
      return sliceLastMinute(state.rawBuffer, now, (item) => item.timestamp);
    },
    lastMinuteNormalized(now: number = Date.now()) {
      return sliceLastMinute(
        state.normalized,
        now,
        (item) => item.timestamp
      );
    },
    lastMinuteWindows(now: number = Date.now()) {
      return sliceLastMinute(
        state.detectedWindows,
        now,
        (item) => item.end
      );
    },
    flags() {
      return { ...state.flags };
    },
  };

  return {
    getState,
    setState,
    subscribe,
    actions,
    selectors,
  };
};

export const useRabitStore = createRabitStore();
