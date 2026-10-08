import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { Send } from "lucide-react";
import FeedbackController from "../controller/FeedbackController";
import { handleApiError } from "../controller/util/ErrorHandler";
import { FEEDBACK_MAX_LENGTH } from "../utils/feedback";
import Dialog from "./ui/Dialog";

/** Lets a logged-in user tell us what went wrong or what is missing; the current page is sent along. */
export default function FeedbackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [busy, setBusy] = useState(false);
    const close = () => {
        if (!busy) onClose();
    };

    return (
        <Dialog open={open} onClose={close} labelledBy="feedback-title" className="confirm-dialog">
            <h2 id="feedback-title">Feedback geben</h2>
            {/* only mounted while the dialog is open, so it starts empty every time */}
            <FeedbackForm busy={busy} onBusyChange={setBusy} onClose={close} />
        </Dialog>
    );
}

function FeedbackForm({ busy, onBusyChange, onClose }: {
    busy: boolean;
    onBusyChange: (busy: boolean) => void;
    onClose: () => void;
}) {
    const { pathname } = useLocation();
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!text.trim()) {
            setError("Bitte schreib kurz, worum es geht.");
            return;
        }
        onBusyChange(true);
        setError(null);
        try {
            await FeedbackController.submit({ text: text.trim(), page: pathname });
            setSent(true);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            onBusyChange(false);
        }
    }

    if (sent) {
        return (
            <>
                <p className="form-message form-message--success" role="status">
                    Danke für dein Feedback! Es ist angekommen.
                </p>
                <div className="profile-form-actions">
                    <button type="button" className="btn" onClick={onClose}>Schließen</button>
                </div>
            </>
        );
    }

    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <p className="muted">
                Ist dir ein Fehler aufgefallen oder fehlt dir etwas? Die Seite, auf der du gerade bist, wird mitgeschickt.
            </p>
            <label className="field">
                Dein Feedback
                <textarea
                    className="input"
                    rows={6}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={FEEDBACK_MAX_LENGTH}
                    placeholder="z. B. Beim Rezept „Ramen“ fehlt eine Zutat."
                    required
                />
            </label>
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
            <div className="profile-form-actions">
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
                    Abbrechen
                </button>
                <button type="submit" className="btn" disabled={busy}>
                    <Send size={16} />
                    {busy ? "Wird gesendet …" : "Absenden"}
                </button>
            </div>
        </form>
    );
}
