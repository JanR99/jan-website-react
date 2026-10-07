import { lazy, Suspense, useState } from "react";
import type { KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import PlaceSearchController from "../../controller/PlaceSearchController";
import { PlaceSearchResult, TravelPosition } from "../../types/Travel";

const TravelLocationMap = lazy(() => import("./TravelLocationMap"));

interface TravelLocationPickerProps {
    position: TravelPosition | null;
    onChange: (position: TravelPosition | null) => void;
    /** searched for if the search field is empty, e.g. name and country of the folder */
    suggestion: string;
}

/** Chooses where a folder is shown on the map: search for a place, then move the pin if needed. */
export default function TravelLocationPicker({ position, onChange, suggestion }: TravelLocationPickerProps) {
    const [query, setQuery] = useState("");
    const [places, setPlaces] = useState<PlaceSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    function choose(place: PlaceSearchResult) {
        onChange({ latitude: place.latitude, longitude: place.longitude });
    }

    async function search() {
        const text = query.trim() || suggestion.trim();
        if (!text || searching) return;

        setSearching(true);
        setMessage(null);
        setPlaces([]);
        try {
            const found = await PlaceSearchController.search(text);
            setPlaces(found);
            if (found.length > 0) {
                // the best hit right away; the others stay as a choice
                choose(found[0]);
            } else {
                setMessage(`Kein Ort für „${text}“ gefunden.`);
            }
        } catch (err) {
            console.error("Error searching for a place:", err);
            setMessage("Die Ortssuche ist gerade nicht erreichbar. Du kannst den Pin auch direkt auf der Karte setzen.");
        } finally {
            setSearching(false);
        }
    }

    function searchOnEnter(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key !== "Enter") return;
        // Enter would save the folder otherwise
        event.preventDefault();
        void search();
    }

    return (
        <div className="field travel-location">
            <span>Ort auf der Karte <span className="muted travel-folder-optional">(optional)</span></span>

            <div className="travel-location-search">
                <input
                    className="input"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={searchOnEnter}
                    placeholder={suggestion.trim() || "Ort suchen"}
                    aria-label="Ort suchen"
                    maxLength={120}
                />
                <button type="button" className="btn btn-secondary" onClick={() => void search()} disabled={searching}>
                    <Search size={18} />
                    {searching ? "Sucht …" : "Suchen"}
                </button>
            </div>

            {places.length > 1 && (
                <ul className="travel-location-results" aria-label="Gefundene Orte">
                    {places.map((place) => {
                        const chosen = place.latitude === position?.latitude && place.longitude === position?.longitude;
                        return (
                            <li key={`${place.latitude},${place.longitude},${place.label}`}>
                                <button
                                    type="button"
                                    className={chosen ? "is-active" : undefined}
                                    aria-pressed={chosen}
                                    onClick={() => choose(place)}
                                >
                                    {place.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
            {message && <p className="muted travel-location-hint" role="status">{message}</p>}

            <Suspense fallback={<div className="travel-map travel-map--picker" aria-hidden="true" />}>
                <TravelLocationMap position={position} onChange={onChange} />
            </Suspense>

            <div className="travel-location-footer">
                <span className="muted travel-location-hint">
                    {position
                        ? "Zum Korrigieren den Pin ziehen oder auf die Karte klicken."
                        : "Suche einen Ort oder klicke auf die Karte, um den Pin zu setzen."}
                </span>
                {position && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(null)}>
                        <X size={16} />
                        Ort entfernen
                    </button>
                )}
            </div>
        </div>
    );
}
