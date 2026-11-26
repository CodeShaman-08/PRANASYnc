"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_BIOMETRICS } from "@/lib/prakriti";
import { hasWearableData, normalizeWearablePayload, WEARABLE_PROVIDERS } from "@/lib/wearables";
import type {
  Biometrics,
  Evaluation,
  HistoryEntry,
  Prakriti,
  WearableConnection,
  WearableProvider,
  WearableSnapshot,
  WeatherOverride,
} from "@/lib/types";
import { useGeolocation, type Coords, type GeoStatus } from "@/hooks/useGeolocation";

const STORAGE_KEY = "pranasync:v1";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

interface PersistedStore {
  profileName: string;
  prakriti: Prakriti | null;
  biometrics: Biometrics;
  overrideWeather: WeatherOverride | null;
  history: HistoryEntry[];
  wearables: WearableConnection[];
}

const INITIAL_STORE: PersistedStore = {
  profileName: "Seeker",
  prakriti: null,
  biometrics: { ...DEFAULT_BIOMETRICS },
  overrideWeather: null,
  history: [],
  wearables: [],
};

interface EvaluateInput {
  prakriti?: Prakriti | null;
  biometrics?: Biometrics;
  overrideWeather?: WeatherOverride | null;
  coords?: { lat: number; lon: number };
  profileName?: string;
}

interface PranaContextValue extends PersistedStore {
  hydrated: boolean;
  result: Evaluation | null;
  loading: boolean;
  error: string | null;
  coords: Coords;
  geoStatus: GeoStatus;
  requestGeolocation: () => void;
  savePrakriti: (prakriti: Prakriti, name?: string) => void;
  updateBiometrics: (patch: Partial<Biometrics>) => void;
  setOverrideWeather: (override: WeatherOverride | null) => void;
  setProfileName: (name: string) => void;
  evaluate: (input?: EvaluateInput) => Promise<Evaluation | null>;
  addWearable: (input: {
    provider: WearableProvider;
    label: string;
    token: string;
    bridgeUrl: string;
  }) => WearableConnection;
  removeWearable: (id: string) => void;
  syncWearable: (id: string) => Promise<{ ok: boolean; error?: string }>;
  importWearableSnapshot: (snapshot: WearableSnapshot) => Promise<{ ok: boolean; error?: string }>;
  resetAll: () => void;
}

const PranaContext = createContext<PranaContextValue | null>(null);

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readStore(): PersistedStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedStore>;
    return {
      profileName: typeof parsed.profileName === "string" ? parsed.profileName : INITIAL_STORE.profileName,
      prakriti: parsed.prakriti ?? null,
      biometrics: { ...DEFAULT_BIOMETRICS, ...(parsed.biometrics || {}) },
      overrideWeather: parsed.overrideWeather ?? null,
      history: Array.isArray(parsed.history) ? parsed.history.slice(-14) : [],
      wearables: Array.isArray(parsed.wearables) ? parsed.wearables.slice(-6) : [],
    };
  } catch {
    return null;
  }
}

export function PranaProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<PersistedStore>(INITIAL_STORE);
  const [hydrated, setHydrated] = useState(false);
  const [result, setResult] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { coords, status: geoStatus, request: requestGeolocation } = useGeolocation();
  const storeRef = useRef(store);
  const coordsRef = useRef(coords);
  const requestId = useRef(0);

  storeRef.current = store;
  coordsRef.current = coords;

  useEffect(() => {
    const restored = readStore();
    if (restored) setStore(restored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      /* storage may be unavailable in private mode */
    }
  }, [store, hydrated]);

  const patch = useCallback((updater: (current: PersistedStore) => PersistedStore) => {
    setStore((current) => {
      const next = updater(current);
      storeRef.current = next;
      return next;
    });
  }, []);

  const logHistory = useCallback(
    (evaluation: Evaluation) => {
      patch((current) => {
        const date = todayKey();
        const entry: HistoryEntry = {
          date,
          harmonyScore: evaluation.harmonyScore,
          vata: evaluation.vikriti.vata,
          pitta: evaluation.vikriti.pitta,
          kapha: evaluation.vikriti.kapha,
          aggravatedDosha: evaluation.aggravatedDosha,
          label: evaluation.harmonyLabel,
        };
        const withoutToday = current.history.filter((item) => item.date !== date);
        return {
          ...current,
          history: [...withoutToday, entry]
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-14),
        };
      });
    },
    [patch],
  );

  const evaluate = useCallback(
    async (input: EvaluateInput = {}) => {
      const current = storeRef.current;
      const prakriti = input.prakriti ?? current.prakriti;
      if (!prakriti) {
        setError("Complete the Prakriti quiz first.");
        return null;
      }
      const biometrics = input.biometrics ?? current.biometrics;
      const overrideWeather =
        input.overrideWeather !== undefined ? input.overrideWeather : current.overrideWeather;
      const target = input.coords ?? coordsRef.current;
      const requestNumber = ++requestId.current;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/evaluate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prakriti,
            lat: target.lat,
            lon: target.lon,
            biometrics,
            overrideWeather: overrideWeather ?? undefined,
            profileName: input.profileName ?? current.profileName,
          }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || `Evaluation failed (${response.status})`);
        }
        const evaluation = (await response.json()) as Evaluation;
        if (requestNumber === requestId.current) {
          setResult(evaluation);
          logHistory(evaluation);
        }
        return evaluation;
      } catch (err) {
        if (requestNumber === requestId.current) {
          setError(err instanceof Error ? err.message : "We could not update your reading.");
        }
        return null;
      } finally {
        if (requestNumber === requestId.current) setLoading(false);
      }
    },
    [logHistory],
  );

  const savePrakriti = useCallback(
    (prakriti: Prakriti, name?: string) => {
      patch((current) => ({
        ...current,
        prakriti,
        profileName: name?.trim() || current.profileName,
      }));
    },
    [patch],
  );

  const updateBiometrics = useCallback(
    (updater: Partial<Biometrics>) => {
      patch((current) => ({
        ...current,
        biometrics: { ...current.biometrics, ...updater },
      }));
    },
    [patch],
  );

  const setOverrideWeather = useCallback(
    (override: WeatherOverride | null) => {
      patch((current) => ({ ...current, overrideWeather: override }));
    },
    [patch],
  );

  const setProfileName = useCallback(
    (name: string) => patch((current) => ({ ...current, profileName: name })),
    [patch],
  );

  const addWearable = useCallback(
    (input: { provider: WearableProvider; label: string; token: string; bridgeUrl: string }) => {
      const providerMeta = WEARABLE_PROVIDERS.find((item) => item.id === input.provider);
      const connection: WearableConnection = {
        id:
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `wearable-${Date.now()}`,
        provider: input.provider,
        label: input.label.trim() || providerMeta?.name || "Wearable",
        token: input.token.trim(),
        bridgeUrl: input.bridgeUrl.trim(),
        connectedAt: new Date().toISOString(),
        lastSyncedAt: null,
        lastError: null,
      };
      patch((current) => ({ ...current, wearables: [...current.wearables, connection].slice(-6) }));
      return connection;
    },
    [patch],
  );

  const removeWearable = useCallback(
    (id: string) => {
      patch((current) => ({
        ...current,
        wearables: current.wearables.filter((item) => item.id !== id),
      }));
    },
    [patch],
  );

  const importWearableSnapshot = useCallback(
    async (snapshot: WearableSnapshot) => {
      if (!hasWearableData(snapshot)) {
        return { ok: false, error: "No usable biometric fields found." };
      }
      const merged = { ...storeRef.current.biometrics, ...snapshot };
      patch((current) => ({ ...current, biometrics: merged }));
      const evaluation = await evaluate({ biometrics: merged });
      if (!evaluation) {
        return { ok: false, error: "Data imported, but we could not refresh your reading." };
      }
      return { ok: true };
    },
    [patch, evaluate],
  );

  const syncWearable = useCallback(
    async (id: string) => {
      const connection = storeRef.current.wearables.find((item) => item.id === id);
      if (!connection) return { ok: false, error: "Connection not found." };
      if (!connection.bridgeUrl) {
        const message = "Add a bridge endpoint before syncing.";
        patch((current) => ({
          ...current,
          wearables: current.wearables.map((item) =>
            item.id === id ? { ...item, lastError: message } : item,
          ),
        }));
        return { ok: false, error: message };
      }

      try {
        const response = await fetch(connection.bridgeUrl, {
          headers: {
            Accept: "application/json",
            ...(connection.token ? { Authorization: `Bearer ${connection.token}` } : {}),
          },
        });
        if (!response.ok) throw new Error(`Endpoint responded ${response.status}.`);
        const payload = await response.json();
        const snapshot = normalizeWearablePayload(payload);
        if (!hasWearableData(snapshot)) {
          throw new Error("Endpoint returned no usable biometric fields.");
        }

        const merged = { ...storeRef.current.biometrics, ...snapshot };
        patch((current) => ({
          ...current,
          biometrics: merged,
          wearables: current.wearables.map((item) =>
            item.id === id
              ? { ...item, lastSyncedAt: new Date().toISOString(), lastError: null }
              : item,
          ),
        }));

        const evaluation = await evaluate({ biometrics: merged });
        if (!evaluation) throw new Error("Data synced, but we could not refresh your reading.");
        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Sync failed.";
        patch((current) => ({
          ...current,
          wearables: current.wearables.map((item) =>
            item.id === id ? { ...item, lastError: message } : item,
          ),
        }));
        return { ok: false, error: message };
      }
    },
    [patch, evaluate],
  );

  const resetAll = useCallback(() => {
    storeRef.current = INITIAL_STORE;
    setStore(INITIAL_STORE);
    setResult(null);
    setError(null);
    setLoading(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<PranaContextValue>(
    () => ({
      ...store,
      hydrated,
      result,
      loading,
      error,
      coords,
      geoStatus,
      requestGeolocation,
      savePrakriti,
      updateBiometrics,
      setOverrideWeather,
      setProfileName,
      evaluate,
      addWearable,
      removeWearable,
      syncWearable,
      importWearableSnapshot,
      resetAll,
    }),
    [
      store,
      hydrated,
      result,
      loading,
      error,
      coords,
      geoStatus,
      requestGeolocation,
      savePrakriti,
      updateBiometrics,
      setOverrideWeather,
      setProfileName,
      evaluate,
      addWearable,
      removeWearable,
      syncWearable,
      importWearableSnapshot,
      resetAll,
    ],
  );

  return <PranaContext.Provider value={value}>{children}</PranaContext.Provider>;
}

export function usePrana() {
  const context = useContext(PranaContext);
  if (!context) throw new Error("usePrana must be used inside PranaProvider");
  return context;
}
