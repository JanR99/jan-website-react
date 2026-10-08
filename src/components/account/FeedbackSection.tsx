import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ExternalLink, Lock, MessageSquare, RotateCcw, Trash2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import FeedbackController from "../../controller/FeedbackController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { FeedbackDTO } from "../../types/feedback";
import { PERMISSIONS } from "../../types/roles";
import { feedbackDate, githubIssueUrl } from "../../utils/feedback";
import Dialog from "../ui/Dialog";

/** The feedback of the users: read it, turn it into a GitHub issue, mark it as done or delete it. */
export default function FeedbackSection() {
    const { permissions, hasPermission } = useAuth();
    const canManage = hasPermission("MANAGE_FEEDBACK");

    const [items, setItems] = useState<FeedbackDTO[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toDelete, setToDelete] = useState<FeedbackDTO | null>(null);

    // state is only set in the callbacks, once the list has arrived
    const load = useCallback(() => FeedbackController.list().then(setItems, (err) => {
        setError(handleApiError(err));
        setItems((prev) => prev ?? []);
    }), []);

    useEffect(() => {
        if (canManage) void load();
    }, [canManage, load]);

    async function toggleDone(feedback: FeedbackDTO) {
        setError(null);
        try {
            await FeedbackController.setDone(feedback.id, !feedback.done);
            await load();
        } catch (err) {
            setError(handleApiError(err));
        }
    }

    if (permissions === null) {
        return <div className="loading"><div className="spinner" /></div>;
    }

    if (!canManage) {
        return (
            <div className="card empty-state">
                <span className="empty-state-icon"><Lock size={26} /></span>
                <h3>Keine Berechtigung</h3>
                <p>Für diesen Bereich brauchst du das Recht „{PERMISSIONS.MANAGE_FEEDBACK}“.</p>
            </div>
        );
    }

    if (items === null) {
        return <div className="loading"><div className="spinner" /></div>;
    }

    return (
        <div className="account-stack">
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}

            {items.length === 0 ? (
                <div className="card empty-state">
                    <span className="empty-state-icon"><MessageSquare size={26} /></span>
                    <h3>Noch kein Feedback</h3>
                    <p>Angemeldete Nutzer können über „Feedback geben“ unten auf jeder Seite schreiben.</p>
                </div>
            ) : (
                items.map((feedback) => (
                    <article key={feedback.id} className={`card card-pad feedback-item${feedback.done ? " is-done" : ""}`}>
                        <div className="account-card-head">
                            <div className="feedback-meta">
                                <strong>{feedback.userName || "Unbekannt"}</strong>
                                <span className="muted">{feedback.userEmail}</span>
                                <small className="muted">
                                    {feedbackDate(feedback.createdAt)}
                                    {feedback.page
                                        ? <> · <Link to={feedback.page}>{feedback.page}</Link></>
                                        : " · Seite unbekannt"}
                                </small>
                            </div>
                            {feedback.done && <span className="badge">erledigt</span>}
                        </div>
                        <p className="feedback-text">{feedback.text}</p>
                        <div className="feedback-actions">
                            <a
                                className="btn btn-secondary btn-sm"
                                href={githubIssueUrl(feedback)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Öffnet GitHubs Formular mit Titel und Text; Name und E-Mail stehen nicht drin"
                            >
                                <ExternalLink size={16} />
                                Als GitHub-Issue öffnen
                            </a>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleDone(feedback)}>
                                {feedback.done ? <RotateCcw size={16} /> : <Check size={16} />}
                                {feedback.done ? "Wieder öffnen" : "Erledigt"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm recipe-admin-delete"
                                onClick={() => setToDelete(feedback)}
                            >
                                <Trash2 size={16} />
                                Löschen
                            </button>
                        </div>
                    </article>
                ))
            )}

            <DeleteDialog
                feedback={toDelete}
                onClose={() => setToDelete(null)}
                onDeleted={() => {
                    setToDelete(null);
                    void load();
                }}
            />
        </div>
    );
}

function DeleteDialog({ feedback, onClose, onDeleted }: {
    feedback: FeedbackDTO | null;
    onClose: () => void;
    onDeleted: () => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function close() {
        if (busy) return;
        setError(null);
        onClose();
    }

    async function confirm() {
        if (!feedback) return;
        setBusy(true);
        setError(null);
        try {
            await FeedbackController.delete(feedback.id);
            onDeleted();
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={feedback !== null} onClose={close} labelledBy="delete-feedback-title" className="confirm-dialog">
            <h2 id="delete-feedback-title">Feedback löschen?</h2>
            <p className="muted">Das Feedback von {feedback?.userName || "Unbekannt"} wird dauerhaft gelöscht.</p>
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
            <div className="profile-form-actions">
                <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>
                    Abbrechen
                </button>
                <button type="button" className="btn btn-danger" onClick={confirm} disabled={busy}>
                    {busy ? "Wird gelöscht …" : "Löschen"}
                </button>
            </div>
        </Dialog>
    );
}
