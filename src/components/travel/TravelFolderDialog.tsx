import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import TravelController from "../../controller/TravelController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { useRecipes } from "../../hooks/useRecipes";
import { storeTravelFolder } from "../../hooks/useTravelFolders";
import { TravelFolder, TravelPosition } from "../../types/Travel";
import { folderCountry, folderPosition, toMonth } from "../../utils/travel";
import Dialog from "../ui/Dialog";
import TravelLocationPicker from "./TravelLocationPicker";
import TravelMonthField, { monthInput } from "./TravelMonthField";

interface TravelFolderDialogProps {
    open: boolean;
    /** the folder to change, null to create a new one */
    folder: TravelFolder | null;
    onClose: () => void;
    onSaved: (folder: TravelFolder) => void;
}

/** Creates a folder or changes name, country, cuisine, the time of the trip and the place on the map of an existing one. */
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
    const [cuisine, setCuisine] = useState(folder?.cuisine ?? "");
    const [start, setStart] = useState(() => monthInput(folder?.startMonth ?? null));
    const [end, setEnd] = useState(() => monthInput(folder?.endMonth ?? null));
    const [position, setPosition] = useState<TravelPosition | null>(folder ? folderPosition(folder) : null);
    const [error, setError] = useState<string | null>(null);

    const { recipes } = useRecipes();
    // the cuisines of the cookbook; the one of the folder stays selectable even if no recipe has it (any more)
    const cuisines = useMemo(
        () => Array.from(new Set([...recipes.map((r) => r.cuisine), folder?.cuisine ?? ""].filter(Boolean)))
            .sort((a, b) => a.localeCompare(b, "de")),
        [recipes, folder]
    );

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const startMonth = toMonth(start.year, start.month);
        const endMonth = toMonth(end.year, end.month);
        if (startMonth === undefined || endMonth === undefined) {
            setError("Bitte beim Zeitraum jeweils Monat und Jahr angeben.");
            return;
        }
        if (endMonth && !startMonth) {
            setError("Zum Ende des Zeitraums fehlt der Anfang.");
            return;
        }
        if (startMonth && endMonth && endMonth < startMonth) {
            setError("Das Ende des Zeitraums liegt vor dem Anfang.");
            return;
        }

        const request = {
            name: name.trim(),
            country: country.trim(),
            cuisine,
            latitude: position?.latitude ?? null,
            longitude: position?.longitude ?? null,
            startMonth,
            endMonth,
        };
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
            <label className="field">
                <span>Küche im Kochbuch <span className="muted travel-folder-optional">(optional, ihre Rezepte stehen dann bei der Reise)</span></span>
                <select className="input" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                    <option value="">Keine</option>
                    {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            </label>
            <div className="field travel-period">
                <span>Zeitraum <span className="muted travel-folder-optional">(optional, „Bis“ nur bei mehreren Monaten)</span></span>
                <TravelMonthField label="Von" value={start} onChange={setStart} />
                <TravelMonthField label="Bis" value={end} onChange={setEnd} />
            </div>
            <TravelLocationPicker
                position={position}
                onChange={setPosition}
                suggestion={[name.trim(), folderCountry({ name, country })].filter(Boolean).join(", ")}
            />
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
