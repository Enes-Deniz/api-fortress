import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiMode } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

const DEFAULT_INSECURE = "http://127.0.0.1:5001";
const DEFAULT_SECURE = "http://127.0.0.1:5002";

function readStoredMode(): ApiMode {
  const raw = localStorage.getItem(STORAGE_KEYS.apiMode);
  return raw === "secure" ? "secure" : "insecure";
}

export function useApiMode() {
  const [mode, setModeState] = useState<ApiMode>(readStoredMode);
  const prevModeRef = useRef<ApiMode | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.apiMode, mode);
    if (prevModeRef.current !== null && prevModeRef.current !== mode) {
      localStorage.removeItem(STORAGE_KEYS.accessToken);
    }
    prevModeRef.current = mode;
  }, [mode]);

  const setMode = useCallback((next: ApiMode) => {
    setModeState(next);
  }, []);

  const baseUrl =
    mode === "secure"
      ? import.meta.env.VITE_API_SECURE_URL || DEFAULT_SECURE
      : import.meta.env.VITE_API_INSECURE_URL || DEFAULT_INSECURE;

  return { mode, setMode, baseUrl };
}
