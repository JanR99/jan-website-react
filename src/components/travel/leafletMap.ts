import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TravelPosition } from "../../types/Travel";
// after the styles of Leaflet, so it can change them
import "../../styles/TravelMap.css";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>-Mitwirkende';

/** A Leaflet map with the tiles of OpenStreetMap (no API key). The caller sets the view and removes the map again. */
export function createMap(container: HTMLElement, options: L.MapOptions = {}): L.Map {
    const map = L.map(container, options);
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(map);
    return map;
}

/** The pin of a marker; its content (an icon) is rendered by React into the given element. */
export function pinIcon(content: HTMLElement): L.DivIcon {
    return L.divIcon({
        html: content,
        className: "travel-pin",
        iconSize: [32, 32],
        // the tip of the pin
        iconAnchor: [16, 31],
        popupAnchor: [0, -30],
    });
}

export function toLatLng(position: TravelPosition): L.LatLngTuple {
    return [position.latitude, position.longitude];
}
