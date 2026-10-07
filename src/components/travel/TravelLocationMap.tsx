import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { MapPin } from "lucide-react";
import L from "leaflet";
import { TravelPosition } from "../../types/Travel";
import { roundPosition } from "../../utils/travel";
import { createMap, pinIcon, toLatLng } from "./leafletMap";

/** Where the map starts while there is no pin: Europe. */
const START: L.LatLngTuple = [48, 10];
const START_ZOOM = 3;
/** Close enough to see where exactly the pin is. */
const PIN_ZOOM = 10;

/** wrap(): after moving the map around the world the longitude would be beyond 180 degrees. */
function toPosition(latLng: L.LatLng): TravelPosition {
    const { lat, lng } = latLng.wrap();
    return roundPosition(lat, lng);
}

interface TravelLocationMapProps {
    position: TravelPosition | null;
    onChange: (position: TravelPosition) => void;
}

/**
 * A small map to choose a place: a click sets the pin, and the pin can be dragged.
 * Loaded on demand (React.lazy), like TravelMap.
 */
export default function TravelLocationMap({ position, onChange }: TravelLocationMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const hasViewRef = useRef(false);
    const onChangeRef = useRef(onChange);
    // Leaflet owns the marker; React renders the icon into this element
    const pin = useMemo(() => document.createElement("span"), []);

    useEffect(() => {
        onChangeRef.current = onChange;
    });

    useEffect(() => {
        if (!containerRef.current) return;
        const map = createMap(containerRef.current, { minZoom: 2 });
        map.on("click", (event) => onChangeRef.current(toPosition(event.latlng)));
        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
            hasViewRef.current = false;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        if (!position) {
            markerRef.current?.remove();
            markerRef.current = null;
            if (!hasViewRef.current) map.setView(START, START_ZOOM);
            hasViewRef.current = true;
            return;
        }

        const latLng = toLatLng(position);
        if (markerRef.current) {
            markerRef.current.setLatLng(latLng);
        } else {
            const marker = L.marker(latLng, { icon: pinIcon(pin), draggable: true, keyboard: false, title: "Pin verschieben" });
            marker.on("dragend", () => onChangeRef.current(toPosition(marker.getLatLng())));
            markerRef.current = marker.addTo(map);
        }

        if (!hasViewRef.current) {
            map.setView(latLng, PIN_ZOOM);
        } else if (map.getZoom() < PIN_ZOOM - 2 || !map.getBounds().contains(latLng)) {
            // a place the search found, or a click from far away: go there
            map.setView(latLng, Math.max(map.getZoom(), PIN_ZOOM));
        }
        hasViewRef.current = true;
    }, [position, pin]);

    return (
        <>
            <div
                ref={containerRef}
                className="travel-map travel-map--picker"
                role="region"
                aria-label="Karte, um den Ort der Reise zu wählen"
            />
            {createPortal(<MapPin size={32} aria-hidden="true" />, pin)}
        </>
    );
}
