"use client";

import { useCallback, useRef, useState } from "react";

export interface Coords {
  lat: number;
  lon: number;
  accuracy: number | null;
  source: "gps" | "fallback";
}

export type GeoStatus = "idle" | "prompting" | "granted" | "denied" | "unsupported";

/**
 * A neutral fallback so the app can still render. It is never presented as the
 * user's real location: `source: "fallback"` lets the UI show an "approximate"
 * notice and offer a retry.
 */
const FALLBACK: Coords = { lat: 20.5937, lon: 78.9629, accuracy: null, source: "fallback" };

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords>(FALLBACK);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const inFlight = useRef(false);

  const request = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("prompting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        inFlight.current = false;
        setCoords({
          lat: Number(position.coords.latitude.toFixed(5)),
          lon: Number(position.coords.longitude.toFixed(5)),
          accuracy: Math.round(position.coords.accuracy),
          source: "gps",
        });
        setStatus("granted");
      },
      () => {
        inFlight.current = false;
        setStatus("denied");
      },
      {
        // Ask the device for the most precise fix it can provide. A cached
        // position is deliberately rejected so the reading matches the moment.
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }, []);

  return { coords, status, request, setCoords };
}
