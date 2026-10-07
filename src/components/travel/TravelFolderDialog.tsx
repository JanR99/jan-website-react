import { useState } from "react";
import type { FormEvent } from "react";
import TravelController from "../../controller/TravelController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { storeTravelFolder } from "../../hooks/useTravelFolders";
import { TravelFolder } from "../../types/Travel";
import Dialog from "../ui/Dialog";

interface TravelFolderDialogProps {
    open: boolean;
    /** the folder to change, null to create a new one */
    folder: TravelFolder | null;
    onClose: () => void;
    onSaved: (folder: TravelFolder) => void;
}

/** Creates a folder or changes name and country of an existing one. */
export default function TravelFolderDialog({ open, folder, onClose, onSaved }: TravelFolderDialogProps) {
    const [busy, setBusy] = useState(false);
    const close = () => {
        if (!busy) onClose();
    };

    return (
        <Dialog open={open} onClose={close} labelledBy="travel-folder-title" className="confirm-dialog">
            <h2 id="travel-folder-title">{folder ? "Ordner bearbeiten" : "Neuer Ordner"}</h2>
            {/* only mounted while the dialog is open, so the fields start fresh every time */}
            <TravelFolderForm folder={folder} busy={busy} onBusyChange={setBusy} onCancel={close} onSaved={onSaved} />
        </Dialog>
    );
}

function TravelFolderForm({ folder, busy, onBusyChange, onCancel, onSaved }: {
    folder: TravelFolder | null;
    busy: boolean;
    onBusyChange: (busy: boolean) => void;
    onCancel: () => void;
    onSaved: (folder: TravelFolder) => void;
}) {
    const [name, setName] = useState(folder?.name ?? "");
    const [country, setCountry] = useState(folder?.country ?? "");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const request = { name: name.trim(), country: country.trim() };
        if (!request.name) {
            setError("Der Name darf nicht leer sein.");
            return;
        }

        onBusyChange(true);
        setError(null);
        try {
            const saved = folder
                ? await TravelController.updateFolder(folder.id, request)
                : await TravelController.createFolder(request);
            storeTravelFolder(saved);
            onBusyChange(false);
            onSaved(saved);
        } catch (err) {
            onBusyChange(false);
            setError(handleApiError(err));
        }
    }

    return (
        <form className="travel-folder-form" onSubmit={handleSubmit}>
            <label className="field">
                Name
                <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="z. B. Porto"
                    maxLength={80}
                    required
                />
            </label>
            <label className="field">
                <span>Land <span className="muted travel-folder-optional">(optional)</span></span>
                <input
                    className="input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="z. B. Portugal"
                    maxLength={80}
                />
            </label>
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
            <div className="profile-form-actions">
                <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
                    Abbrechen
                </button>
                <button type="submit" className="btn" disabled={busy}>
                    {busy ? "Wird gespeichert …" : folder ? "Speichern" : "Ordner anlegen"}
                </button>
            </div>
        </form>
    );
}
