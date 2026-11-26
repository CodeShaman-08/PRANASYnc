"use client";

import { useState } from "react";
import {
  Activity,
  Check,
  Link2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Watch,
} from "lucide-react";
import { usePrana } from "@/context/PranaContext";
import {
  WEARABLE_PROVIDERS,
  bridgeHost,
  maskToken,
  normalizeWearablePayload,
} from "@/lib/wearables";
import type { WearableProvider } from "@/lib/types";

type Feedback = { tone: "ok" | "error"; text: string } | null;

function formatSync(iso: string | null) {
  if (!iso) return "never synced";
  return `synced ${new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function WearableApiPanel() {
  const { wearables, addWearable, removeWearable, syncWearable, importWearableSnapshot } = usePrana();
  const [provider, setProvider] = useState<WearableProvider>("fitbit");
  const [label, setLabel] = useState("");
  const [bridgeUrl, setBridgeUrl] = useState("");
  const [token, setToken] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);

  const providerMeta = WEARABLE_PROVIDERS.find((item) => item.id === provider) ?? WEARABLE_PROVIDERS[0];

  const addConnection = () => {
    setFeedback(null);
    const trimmed = bridgeUrl.trim();
    if (!trimmed) {
      setFeedback({ tone: "error", text: "Add the URL of your personal bridge first." });
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      setFeedback({ tone: "error", text: "That endpoint is not a valid URL." });
      return;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      setFeedback({ tone: "error", text: "Use an http(s) endpoint." });
      return;
    }

    addWearable({ provider, label, token, bridgeUrl: trimmed });
    setLabel("");
    setBridgeUrl("");
    setToken("");
    setFeedback({ tone: "ok", text: `${providerMeta.name} endpoint saved. Run a sync to pull biometrics.` });
  };

  const runSync = async (id: string) => {
    setSyncing(id);
    setFeedback(null);
    const result = await syncWearable(id);
    setFeedback(
      result.ok
        ? { tone: "ok", text: "Biometrics synced and your reading refreshed." }
        : { tone: "error", text: result.error ?? "Sync failed." },
    );
    setSyncing(null);
  };

  const importSnapshot = async () => {
    setFeedback(null);
    let payload: unknown;
    try {
      payload = JSON.parse(importJson);
    } catch {
      setFeedback({ tone: "error", text: "That data could not be read." });
      return;
    }
    setImporting(true);
    const result = await importWearableSnapshot(normalizeWearablePayload(payload));
    setFeedback(
      result.ok
        ? { tone: "ok", text: "Snapshot imported into your biometrics." }
        : { tone: "error", text: result.error ?? "Import failed." },
    );
    setImporting(false);
  };

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-neutral-900/[0.07] blur-3xl" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
            <Watch className="h-3 w-3" /> Your devices
          </div>
          <h3 className="mt-1.5 text-[15px] font-medium tracking-tight text-neutral-900">
            Connect your Fitbit or Apple Watch
          </h3>
          <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-neutral-500">
            Connect a private link you control that shares sleep, heart rate, HRV and step data.
            PranaSync reads it and refreshes your guidance.
          </p>
        </div>
        <span className="rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2 py-0.5 text-[8.5px] uppercase tracking-[0.1em] text-neutral-500">
          {wearables.length} connected
        </span>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex flex-wrap items-center gap-1 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] p-1">
            {WEARABLE_PROVIDERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setProvider(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  provider === item.id
                    ? "bg-neutral-900/10 text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {item.id === "fitbit" ? <Activity className="h-3 w-3" /> : <Watch className="h-3 w-3" />}
                {item.name}
              </button>
            ))}
          </div>

          <p className="mt-2 flex gap-1.5 text-[10px] leading-relaxed text-neutral-500">
            <Link2 className="mt-0.5 h-3 w-3 shrink-0" /> {providerMeta.note}
          </p>

          <div className="mt-3 space-y-2.5">
            <label className="block">
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Label (optional)
              </span>
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value.slice(0, 40))}
                placeholder={providerMeta.name}
                className="mt-1 w-full rounded-xl border border-neutral-900/10 bg-neutral-900/[0.03] px-3 py-2 text-[11.5px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-700/40"
              />
            </label>

            <label className="block">
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Data link URL
              </span>
              <input
                value={bridgeUrl}
                onChange={(event) => setBridgeUrl(event.target.value)}
                placeholder="https://your-link.dev/biometrics"
                inputMode="url"
                className="mt-1 w-full rounded-xl border border-neutral-900/10 bg-neutral-900/[0.03] px-3 py-2 font-mono text-[11px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-700/40"
              />
            </label>

            <label className="block">
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Access token
              </span>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Optional — sent as a secure header"
                type="password"
                autoComplete="off"
                className="mt-1 w-full rounded-xl border border-neutral-900/10 bg-neutral-900/[0.03] px-3 py-2 font-mono text-[11px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-700/40"
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addConnection}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-2 text-[10.5px] font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              <Plus className="h-3 w-3" /> Add connection
            </button>
            <span className="inline-flex items-center gap-1 text-[9px] text-neutral-400">
              <ShieldCheck className="h-2.5 w-2.5" /> stored only in this browser
            </span>
          </div>

          {feedback && (
            <p
              className={`mt-2 flex items-start gap-1.5 rounded-lg border px-2.5 py-2 text-[10px] leading-relaxed ${
                feedback.tone === "ok"
                  ? "border-neutral-900/10 bg-neutral-900/[0.03] text-neutral-700"
                  : "border-neutral-700/20 bg-neutral-700/[0.06] text-neutral-800"
              }`}
            >
              {feedback.tone === "ok" ? (
                <Check className="mt-0.5 h-3 w-3 shrink-0" />
              ) : (
                <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" />
              )}
              {feedback.text}
            </p>
          )}

          <details className="mt-3 rounded-xl border border-neutral-900/[0.06] bg-neutral-900/[0.02] p-3">
            <summary className="cursor-pointer text-[9.5px] font-medium uppercase tracking-[0.14em] text-neutral-600">
              Paste a reading instead
            </summary>
            <p className="mt-2 text-[10px] leading-relaxed text-neutral-500">
              Useful for an Apple Health export or a one-off reading. Accepts a flat object or
              {" "}<code className="rounded bg-neutral-900/[0.06] px-1 py-0.5 font-mono text-[9.5px]">{"{ biometrics: { ... } }"}</code>.
            </p>
            <textarea
              value={importJson}
              onChange={(event) => setImportJson(event.target.value)}
              rows={4}
              placeholder={'{"sleepHours":7.4,"restingHr":58,"hrv":64,"steps":9200}'}
              className="mt-2 w-full resize-y rounded-xl border border-neutral-900/10 bg-white/70 px-3 py-2 font-mono text-[10.5px] leading-relaxed text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-700/40"
            />
            <button
              type="button"
              disabled={importing || !importJson.trim()}
              onClick={importSnapshot}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-neutral-900/10 bg-neutral-900/[0.04] px-3 py-1.5 text-[10px] font-medium text-neutral-800 transition-colors hover:bg-neutral-900/[0.08] disabled:opacity-40"
            >
              {importing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
              Import snapshot
            </button>
          </details>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            <Link2 className="h-3 w-3" /> Saved connections
          </div>

          {wearables.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-900/12 bg-neutral-900/[0.015] px-4 py-6 text-center">
              <Watch className="mx-auto h-5 w-5 text-neutral-400" />
              <p className="mt-2 text-[10.5px] font-medium text-neutral-600">No devices connected</p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-neutral-500">
                Add a data link on the left, then sync to replace manual biometrics with your own
                device data.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {wearables.map((connection) => {
                const meta =
                  WEARABLE_PROVIDERS.find((item) => item.id === connection.provider) ??
                  WEARABLE_PROVIDERS[0];
                const busy = syncing === connection.id;
                return (
                  <div
                    key={connection.id}
                    className="rounded-xl border border-neutral-900/[0.06] bg-neutral-900/[0.02] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-neutral-800">
                          {connection.provider === "fitbit" ? (
                            <Activity className="h-3 w-3" />
                          ) : (
                            <Watch className="h-3 w-3" />
                          )}
                          <span className="truncate">{connection.label}</span>
                        </div>
                        <div className="mt-0.5 truncate font-mono text-[9px] text-neutral-500">
                          {meta.short} · {bridgeHost(connection.bridgeUrl)}
                        </div>
                        <div className="mt-0.5 font-mono text-[9px] text-neutral-400">
                          {maskToken(connection.token)}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-neutral-900/8 bg-neutral-900/[0.03] px-2 py-0.5 text-[8px] uppercase tracking-[0.1em] text-neutral-500">
                        {connection.lastError ? "error" : connection.lastSyncedAt ? "active" : "ready"}
                      </span>
                    </div>

                    <div className="mt-1.5 text-[9px] text-neutral-500">
                      {connection.lastError ? (
                        <span className="text-neutral-700">{connection.lastError}</span>
                      ) : (
                        formatSync(connection.lastSyncedAt)
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void runSync(connection.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/10 bg-neutral-900/[0.05] px-2.5 py-1 text-[9.5px] font-medium text-neutral-800 transition-colors hover:bg-neutral-900/[0.09] disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${busy ? "animate-spin" : ""}`} />
                        {busy ? "Syncing…" : "Sync now"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeWearable(connection.id)}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] text-neutral-500 transition-colors hover:text-neutral-800"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-3 text-[9px] leading-relaxed text-neutral-400">
            The link must allow requests from this site. Fields: sleepHours, restingHr, hrv, steps;
            optional stressLevel and hydration.
          </p>
        </div>
      </div>
    </div>
  );
}
