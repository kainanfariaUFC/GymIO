import { useCallback, useEffect, useState } from "react";

/**
 * Guarda o progresso dos checkboxes apenas na sessão do navegador
 * (sessionStorage) — sem login, sem persistência entre dias.
 */
export function useSessionChecks(storageKey: string) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* ignora */
    }
  }, [storageKey]);

  const toggle = useCallback(
    (id: string) => {
      setChecked((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        try {
          window.sessionStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* ignora */
        }
        return next;
      });
    },
    [storageKey],
  );

  const reset = useCallback(() => {
    setChecked({});
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      /* ignora */
    }
  }, [storageKey]);

  return { checked, toggle, reset };
}
