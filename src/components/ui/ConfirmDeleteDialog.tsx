import { useId, useState } from "react";
import type { ReactNode } from "react";
import { handleApiError } from "../../controller/util/ErrorHandler";
import Dialog from "./Dialog";

interface ConfirmDeleteDialogProps {
    open: boolean;
    title: string;
    onClose: () => void;
    /** Deletes; a thrown error is shown in the dialog, which then stays open. */
    onConfirm: () => Promise<void>;
    /** What gets deleted, shown under the title. */
    children: ReactNode;
}

/** "… löschen?" with Abbrechen and Löschen; can't be closed while deleting. */
export default function ConfirmDeleteDialog({ open, title, onClose, onConfirm, children }: ConfirmDeleteDialogProps) {
    const titleId = useId();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function close() {
        if (busy) return;
        setError(null);
        onClose();
    }

    async function confirm() {
        setBusy(true);
        setError(null);
        try {
            await onConfirm();
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={open} onClose={close} labelledBy={titleId} className="confirm-dialog">
            <h2 id={titleId}>{title}</h2>
            {children}
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
