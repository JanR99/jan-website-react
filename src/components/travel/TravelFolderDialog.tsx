import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";
import TravelController from "../../controller/TravelController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { useRecipes } from "../../hooks/useRecipes";
import { storeTravelFolder, useTravelFolders } from "../../hooks/useTravelFolders";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { TravelFolder } from "../../types/Travel";
import { folderCountry, toMonth } from "../../utils/travel";
import Dialog from "../ui/Dialog";
import TravelMonthField, { monthInput } from "./TravelMonthField";
import TravelStopsEditor, { StopDraft } from "./TravelStopsEditor";

interface TravelFolderDialogProps {
    open: boolean;
    /** the folder to change, null to create a new one */
    folder: TravelFolder | null;
    onClose: () => void;
    onSaved: (folder: TravelFolder) => void;
}

/** Creates a folder or changes name, country, cuisine, the time of the trip, its stops and where it came from. */
export default function TravelFolderDialog({ open, folder, onClose, onSaved }: TravelFolderDialogProps) {
    // only mounted while the dialog is open, so the fields start fresh every time
    return open ? <OpenTravelFolderDialog folder={folder} onClose={onClose} onSaved={onSaved} /> : null;
}

function OpenTravelFolderDialog({ folder, onClose, onSaved }: Omit<TravelFolderDialogProps, "open">) {
    const [busy, setBusy] = useState(false);
    const [name, setName] = useState(folder?.name ?? "");
    const [country, setCountry] = useState(folder?.country ?? "");
    const [cuisine, setCuisine] = useState(folder?.cuisine ?? "");
    const [start, setStart] = useState(() => monthInput(folder?.startMonth ?? null));
    const [end, setEnd] = useState(() => monthInput(folder?.endMonth ?? null));
    // a new folder starts with one stop, so the place can be searched right away as before
    const [stops, setStops] = useState<StopDraft[]>(() =>
        folder
            ? folder.stops.map(({ name, latitude, longitude }) => ({ name, position: { latitude, longitude } }))
            : [{ name: "", position: null }]
    );
    const [previousFolderId, setPreviousFolderId] = useState<number | null>(folder?.previousFolderId ?? null);
    const { folders } = useTravelFolders();
    const otherFolders = folders.filter((other) => other.id !== folder?.id);
    const [error, setError] = useState<string | null>(null);

    // closing by a click next to the dialog, Escape, the X or "Abbrechen" asks first when something was entered
    const mayDiscard = useUnsavedChanges({ name, country, cuisine, start, end, stops, previousFolderId });
    const close = useCallback(() => {
        if (!busy && mayDiscard()) onClose();
    }, [busy, mayDiscard, onClose]);

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

        // a stop nobody touched is left out; one with a name needs its place
        const usedStops = stops.filter((stop) => stop.position || stop.name.trim());
        const withoutPlace = usedStops.findIndex((stop) => !stop.position);
        if (withoutPlace >= 0) {
            setError(`Stopp ${stops.indexOf(usedStops[withoutPlace]) + 1} hat noch keinen Ort auf der Karte.`);
            return;
        }

        const request = {
            name: name.trim(),
            country: country.trim(),
            cuisine,
            stops: usedStops.map((stop) => ({ name: stop.name.trim(), latitude: stop.position!.latitude, longitude: stop.position!.longitude })),
            previousFolderId,
            startMonth,
            endMonth,
        };
        if (!request.name) {
            setError("Der Name darf nicht leer sein.");
            return;
        }

        setBusy(true);
        setError(null);
        try {
            const saved = folder
                ? await TravelController.updateFolder(folder.id, request)
                : await TravelController.createFolder(request);
            storeTravelFolder(saved);
            setBusy(false);
            onSaved(saved);
        } catch (err) {
            setBusy(false);
            setError(handleApiError(err));
        }
    }

    const form = (
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
            <label className="field">
                <span>Reise kommt aus <span className="muted travel-folder-optional">(optional, z. B. das Land davor; verbindet die Stopps auf der Karte)</span></span>
                <select
                    className="input"
                    value={previousFolderId ?? ""}
                    onChange={(e) => setPreviousFolderId(e.target.value ? Number(e.target.value) : null)}
                >
                    <option value="">Keinem anderen Ordner</option>
                    {otherFolders.map((other) => <option key={other.id} value={other.id}>{other.name}</option>)}
                </select>
            </label>
            <TravelStopsEditor
                stops={stops}
                onChange={setStops}
                suggestion={[name.trim(), folderCountry({ name, country })].filter(Boolean).join(", ")}
            />
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
            <div className="profile-form-actions">
                <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>
                    Abbrechen
                </button>
                <button type="submit" className="btn" disabled={busy}>
                    {busy ? "Wird gespeichert …" : folder ? "Speichern" : "Ordner anlegen"}
                </button>
            </div>
        </form>
    );

    return (
        <Dialog open onClose={close} labelledBy="travel-folder-title" className="confirm-dialog">
            <h2 id="travel-folder-title">{folder ? "Ordner bearbeiten" : "Neuer Ordner"}</h2>
            {form}
        </Dialog>
    );
}
