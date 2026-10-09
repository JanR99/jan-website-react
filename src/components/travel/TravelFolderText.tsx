import { useState } from "react";
import { NotebookPen } from "lucide-react";
import TravelController from "../../controller/TravelController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { storeTravelFolder } from "../../hooks/useTravelFolders";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { TravelFolder } from "../../types/Travel";
import { TEXT_MAX_LENGTH, textParagraphs } from "../../utils/travel";

interface TravelFolderTextProps {
    folder: TravelFolder;
    /** lets the text be written and changed */
    canManage: boolean;
}

/** What the diary says about a trip, above its photos. An admin writes it right here on the page. */
export default function TravelFolderText({ folder, canManage }: TravelFolderTextProps) {
    const [editing, setEditing] = useState(false);

    if (canManage && editing) {
        return <TravelTextEditor folder={folder} onDone={() => setEditing(false)} />;
    }

    const paragraphs = textParagraphs(folder.text);
    if (paragraphs.length === 0 && !canManage) {
        return null;
    }
    return (
        <div className="travel-text">
            {paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
            {canManage && (
                <button type="button" className="btn btn-secondary btn-sm travel-text-edit" onClick={() => setEditing(true)}>
                    <NotebookPen size={16} />
                    {paragraphs.length > 0 ? "Text bearbeiten" : "Text schreiben"}
                </button>
            )}
        </div>
    );
}

function TravelTextEditor({ folder, onDone }: { folder: TravelFolder; onDone: () => void }) {
    const [draft, setDraft] = useState(folder.text);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mayDiscard = useUnsavedChanges(draft);

    async function save() {
        setBusy(true);
        setError(null);
        try {
            storeTravelFolder(await TravelController.setText(folder.id, draft));
            onDone();
        } catch (err) {
            setError(handleApiError(err));
            setBusy(false);
        }
    }

    return (
        <div className="travel-text-editor">
            <label className="field">
                Text zur Reise
                <textarea
                    className="input travel-text-input"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Was habt ihr erlebt? Eine Leerzeile beginnt einen neuen Absatz."
                    maxLength={TEXT_MAX_LENGTH}
                    rows={10}
                    autoFocus
                />
            </label>
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
            <div className="travel-text-editor-actions">
                <span className="muted travel-text-count">
                    {draft.length.toLocaleString("de-DE")} / {TEXT_MAX_LENGTH.toLocaleString("de-DE")} Zeichen
                </span>
                <button type="button" className="btn btn-ghost" onClick={() => mayDiscard() && onDone()} disabled={busy}>
                    Abbrechen
                </button>
                <button type="button" className="btn" onClick={() => void save()} disabled={busy}>
                    {busy ? "Wird gespeichert …" : "Speichern"}
                </button>
            </div>
        </div>
    );
}
