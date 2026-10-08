import { useEffect, useState } from "react";

export type WakeLockStatus = "inactive" | "active" | "unsupported" | "failed";

/**
 * Keeps the screen on while `enabled` is true (Screen Wake Lock API).
 * The browser releases the lock whenever the tab is hidden, so it is requested
 * again when the tab becomes visible.
 */
export function useWakeLock(enabled: boolean): WakeLockStatus {
    /** what asking for the lock led to; null while it is not asked for or the answer is still open */
    const [result, setResult] = useState<"active" | "failed" | null>(null);
    const supported = "wakeLock" in navigator;

    useEffect(() => {
        if (!enabled || !supported) return;

        let cancelled = false;
        let sentinel: WakeLockSentinel | null = null;

        const request = async () => {
            if (document.visibilityState !== "visible") return;
            try {
                const lock = await navigator.wakeLock.request("screen");
                if (cancelled) {
                    void lock.release();
                    return;
                }
                sentinel = lock;
                setResult("active");
            } catch {
                // e.g. battery saver mode or no permission
                if (!cancelled) setResult("failed");
            }
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") void request();
        };

        void request();
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            cancelled = true;
            document.removeEventListener("visibilitychange", onVisibilityChange);
            void sentinel?.release().catch(() => undefined);
            setResult(null);
        };
    }, [enabled, supported]);

    if (!enabled) return "inactive";
    if (!supported) return "unsupported";
    return result ?? "inactive";
}
