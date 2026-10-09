import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "./AuthContext";
import "../../styles/SessionNotice.css";

/**
 * Tells a logged-in user a few minutes ahead that the login is about to end, and lets them extend it.
 * Otherwise the page would log out in the middle of writing and what was written would be gone.
 */
export default function SessionExpiryNotice() {
    const { sessionEndsAt, extendSession } = useAuth();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    /** the end the notice was closed for; an extended login that ends later is announced again */
    const [closedFor, setClosedFor] = useState<number | null>(null);

    if (sessionEndsAt === null || sessionEndsAt === closedFor) return null;

    async function extend() {
        setBusy(true);
        setError(null);
        const result = await extendSession();
        setBusy(false);
        if (!result.ok) setError(result.error);
    }

    const time = new Date(sessionEndsAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="session-notice" role="alert">
            <p>Deine Anmeldung läuft um {time} Uhr ab. Was du bis dahin nicht gespeichert hast, geht verloren.</p>
            {error && <p className="form-message form-message--error">{error}</p>}
            <div className="session-notice-actions">
                <button type="button" className="btn btn-sm" onClick={() => void extend()} disabled={busy}>
                    {busy ? "Wird verlängert …" : "Verlängern"}
                </button>
            </div>
            <button
                type="button"
                className="icon-btn session-notice-close"
                onClick={() => setClosedFor(sessionEndsAt)}
                aria-label="Hinweis schließen"
            >
                <X size={18} />
            </button>
        </div>
    );
}
