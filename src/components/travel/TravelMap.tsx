import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import L from "leaflet";
import TravelController from "../../controller/TravelController";
import { TravelFolder } from "../../types/Travel";
import { crowdedFolders, folderStops, folderSubtitle, mapLayout, photoCountLabel, travelFolderPath } from "../../utils/travel";
import { createMap, pinIcon, toLatLng } from "./leafletMap";
import { zoomWithModifierWheel } from "./modifierWheelZoom";

/** Closer than this on the screen (in pixels), two pins of a folder would cover each other: the folder becomes one pin. */
const MIN_PIN_DISTANCE = 28;

const POPUP_OPTIONS: L.PopupOptions = { className: "travel-map-popup", closeButton: false, minWidth: 200, maxWidth: 200 };

/** Room around the stops when the map is fitted to them; more at the top, where the pins stick out of their place. */
const FIT_PADDING = { paddingTopLeft: [48, 72] as L.PointTuple, paddingBottomRight: [48, 40] as L.PointTuple };
/** A click on a folder shown as one pin zooms in to its stops, but not further than this. */
const FOLDER_MAX_ZOOM = 12;

/**
 * The map of the travel diary: a pin for every stop of a folder and a line along the stops of each trip,
 * also from the folder the trip came from. Where the stops of a folder would cover each other (zoomed
 * out), the folder is one pin; a click on it zooms in. A click on a stop shows its folder and leads into it.
 * Loaded on demand (React.lazy), so Leaflet is only fetched where a map is shown.
 */
export default function TravelMap({ folders }: { folders: TravelFolder[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    // set by Leaflet whenever the zoom has changed, also for the first view
    const [zoom, setZoom] = useState<number | null>(null);

    // the folders shown as one pin at this zoom, as a text, so the pins are only built again when it changes
    const crowdedKey = useMemo(() => {
        if (zoom === null) return null;
        const toPoint = (position: { latitude: number; longitude: number }) =>
            L.CRS.EPSG3857.latLngToPoint(L.latLng(position.latitude, position.longitude), zoom);
        return [...crowdedFolders(folders, toPoint, MIN_PIN_DISTANCE)].sort((a, b) => a - b).join(",");
    }, [folders, zoom]);

    // Leaflet owns the markers and popups; React renders their content into these elements
    const layout = useMemo(() => {
        if (crowdedKey === null) return { pins: [], lines: [] };
        const crowded = new Set(crowdedKey ? crowdedKey.split(",").map(Number) : []);
        const { pins, lines } = mapLayout(folders, crowded);
        return {
            lines,
            pins: pins.map((pin) => ({ ...pin, icon: document.createElement("span"), popup: document.createElement("div") })),
        };
    }, [folders, crowdedKey]);

    useEffect(() => {
        if (!containerRef.current) return;
        const map = createMap(containerRef.current, {
            // the mouse wheel zooms only with Ctrl/Cmd, see below; otherwise the buttons, a double click or two fingers
            scrollWheelZoom: true,
            dragging: !window.matchMedia("(pointer: coarse)").matches,
            minZoom: 2,
        });
        map.on("zoomend", () => setZoom(map.getZoom()));
        // without the key the page keeps scrolling over the map
        const removeWheelZoom = zoomWithModifierWheel(containerRef.current);
        mapRef.current = map;
        return () => {
            removeWheelZoom();
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // the view with all stops; only when the folders change, not when zooming changes the pins
    useEffect(() => {
        const map = mapRef.current;
        const places = folders.flatMap((folder) => folderStops(folder)).map(toLatLng);
        if (!map || places.length === 0) return;
        if (places.length === 1) {
            map.setView(places[0], 6);
        } else {
            map.fitBounds(L.latLngBounds(places), { ...FIT_PADDING, maxZoom: 7 });
        }
    }, [folders]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || layout.pins.length === 0) return;

        const routes = layout.lines.map((line) => L.polyline(line.map(toLatLng), { className: "travel-route", interactive: false }));
        const markers = layout.pins.map(({ folder, stop, wholeFolder, icon, popup }) => {
            if (!wholeFolder) {
                const title = stop.name && stop.name !== folder.name ? `${stop.name} · ${folder.name}` : folder.name;
                return L.marker(toLatLng(stop), { icon: pinIcon(icon), title, alt: title }).bindPopup(popup, POPUP_OPTIONS);
            }

            const stops = folderStops(folder).map(toLatLng);
            const title = `${folder.name}: ${stops.length} Stopps – zum Reinzoomen klicken`;
            const marker = L.marker(toLatLng(stop), { icon: pinIcon(icon), title, alt: title });
            marker.on("click", () => {
                const bounds = L.latLngBounds(stops);
                const padding = L.point(96, 112);
                const target = Math.min(map.getBoundsZoom(bounds, false, padding), FOLDER_MAX_ZOOM);
                if (target > map.getZoom()) {
                    map.fitBounds(bounds, { ...FIT_PADDING, maxZoom: FOLDER_MAX_ZOOM });
                } else {
                    // stops at almost the same place stay one pin however far one zooms in: show the folder instead
                    marker.bindPopup(popup, POPUP_OPTIONS).openPopup();
                }
            });
            return marker;
        });
        const layer = L.layerGroup([...routes, ...markers]).addTo(map);
        return () => {
            layer.remove();
        };
    }, [layout]);

    return (
        <>
            <div ref={containerRef} className="travel-map" role="region" aria-label="Karte mit den Reisen" />
            {layout.pins.map(({ key, folder, wholeFolder, icon }) =>
                createPortal(
                    wholeFolder ? <FolderPin count={folderStops(folder).length} /> : <MapPin size={32} aria-hidden="true" />,
                    icon,
                    `pin-${key}`
                )
            )}
            {layout.pins.map(({ key, folder, stop, wholeFolder, popup }) =>
                createPortal(<TravelMapCard folder={folder} stopName={wholeFolder ? "" : stop.name} />, popup, `popup-${key}`)
            )}
        </>
    );
}

/** The pin of a folder shown as one pin, with the number of its stops. */
function FolderPin({ count }: { count: number }) {
    return (
        <>
            <MapPin size={32} aria-hidden="true" />
            <span className="travel-pin-count" aria-hidden="true">{count}</span>
        </>
    );
}

/** What the popup of a pin shows: the folder with its cover photo and the stop, as a link into the folder. */
function TravelMapCard({ folder, stopName }: { folder: TravelFolder; stopName: string }) {
    const subtitle = folderSubtitle(folder);
    // a folder with a single stop usually has it named like itself
    const showStop = stopName !== "" && stopName !== folder.name;

    return (
        <Link to={travelFolderPath(folder)} className="travel-map-card">
            {folder.coverPhotoId !== null && <img src={TravelController.photoUrl(folder.coverPhotoId)} alt="" />}
            <span className="travel-map-card-body">
                {subtitle && <span className="travel-map-card-country">{subtitle}</span>}
                <strong>{folder.name}</strong>
                {showStop && <span className="travel-map-card-stop">{stopName}</span>}
                <span className="travel-map-card-cta">
                    {photoCountLabel(folder.photos.length)} <ArrowRight size={14} />
                </span>
            </span>
        </Link>
    );
}
