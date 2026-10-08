import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { TravelPosition } from "../../types/Travel";
import { MAX_STOPS, placeName } from "../../utils/travel";
import TravelLocationPicker from "./TravelLocationPicker";

/** A stop while it is edited: the place may still be missing. */
export interface StopDraft {
    name: string;
    position: TravelPosition | null;
    /** the name the place search filled in; replaced by the next found place unless the name was changed by hand */
    autoName?: string;
}

interface TravelStopsEditorProps {
    stops: StopDraft[];
    onChange: (stops: StopDraft[]) => void;
    /** searched for if the search field is empty and the stop has no name yet, e.g. name and country of the folder */
    suggestion: string;
}

/** The stops of a trip in their order: added, named, moved up and down and removed; the place of the chosen one is set below. */
export default function TravelStopsEditor({ stops, onChange, suggestion }: TravelStopsEditorProps) {
    const [selected, setSelected] = useState(0);
    const current = Math.min(selected, stops.length - 1);
    const stop = current >= 0 ? stops[current] : null;

    function update(index: number, change: Partial<StopDraft>) {
        onChange(stops.map((other, i) => (i === index ? { ...other, ...change } : other)));
    }

    function add() {
        onChange([...stops, { name: "", position: null }]);
        setSelected(stops.length);
    }

    function move(index: number, by: -1 | 1) {
        const next = [...stops];
        [next[index], next[index + by]] = [next[index + by], next[index]];
        onChange(next);
        setSelected(index + by);
    }

    function remove(index: number) {
        onChange(stops.filter((_, i) => i !== index));
        setSelected(Math.max(0, index <= current ? current - 1 : current));
    }

    return (
        <div className="field travel-stops">
            <span>
                Stopps <span className="muted travel-folder-optional">(optional, in der Reihenfolge der Reise)</span>
            </span>

            {stops.length > 0 && (
                <ol className="travel-stop-list">
                    {stops.map((item, index) => (
                        <li key={index} className={index === current ? "is-selected" : undefined}>
                            <button
                                type="button"
                                className="travel-stop-number"
                                onClick={() => setSelected(index)}
                                aria-pressed={index === current}
                                aria-label={`Ort von Stopp ${index + 1} auf der Karte bearbeiten`}
                                title={item.position ? "Ort auf der Karte bearbeiten" : "Noch ohne Ort"}
                            >
                                {index + 1}
                            </button>
                            <input
                                className="input"
                                value={item.name}
                                onChange={(e) => update(index, { name: e.target.value })}
                                onFocus={() => setSelected(index)}
                                placeholder={item.position ? "Name des Stopps" : "Noch ohne Ort"}
                                maxLength={80}
                                aria-label={`Name von Stopp ${index + 1}`}
                            />
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm travel-stop-action"
                                onClick={() => move(index, -1)}
                                disabled={index === 0}
                                aria-label={`Stopp ${index + 1} nach oben`}
                            >
                                <ArrowUp size={16} />
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm travel-stop-action"
                                onClick={() => move(index, 1)}
                                disabled={index === stops.length - 1}
                                aria-label={`Stopp ${index + 1} nach unten`}
                            >
                                <ArrowDown size={16} />
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm travel-stop-action travel-delete"
                                onClick={() => remove(index)}
                                aria-label={`Stopp ${index + 1} entfernen`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </li>
                    ))}
                </ol>
            )}

            <div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={add} disabled={stops.length >= MAX_STOPS}>
                    <Plus size={16} />
                    Stopp hinzufügen
                </button>
            </div>

            {stop && (
                <TravelLocationPicker
                    // a fresh search for every stop
                    key={current}
                    label={`Ort von Stopp ${current + 1}${stop.name.trim() ? ` (${stop.name.trim()})` : ""}`}
                    position={stop.position}
                    onChange={(position) => update(current, { position })}
                    onPlaceChosen={(place) => {
                        const name = placeName(place.label);
                        if (!stop.name.trim() || stop.name === stop.autoName) {
                            update(current, { position: { latitude: place.latitude, longitude: place.longitude }, name, autoName: name });
                        }
                    }}
                    suggestion={stop.name.trim() || suggestion}
                />
            )}
        </div>
    );
}
