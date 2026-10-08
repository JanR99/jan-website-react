import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import L from "leaflet";
import TravelController from "../../controller/TravelController";
import { TravelFolder } from "../../types/Travel";
import { folderStops, folderSubtitle, photoCountLabel, routeLines, travelFolderPath } from "../../utils/travel";
import { createMap, pinIcon, toLatLng } from "./leafletMap";
import { zoomWithModifierWheel } from "./modifierWheelZoom";

/**
 * The map of the travel diary: a pin for every stop of a folder and a line along the stops of each trip,
 * also from the folder the trip came from. A click on a pin shows its folder and leads into it.
 * Loaded on demand (React.lazy), so Leaflet is only fetched where a map is shown.
 */
export default function TravelMap({ folders }: { folders: TravelFolder[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    // Leaflet owns the markers and popups; React renders their content into these elements
    const pins = useMemo(
        () =>
            folders.flatMap((folder) =>
                folderStops(folder).map((stop, index) => ({
                    key: `${folder.id}-${index}`,
                    folder,
                    stop,
                    icon: document.createElement("span"),
                    popup: document.createElement("div"),
                }))
            ),
        [folders]
    );
    const lines = useMemo(() => routeLines(folders), [folders]);

    useEffect(() => {
        if (!containerRef.current) return;
        const map = createMap(containerRef.current, {
            // the mouse wheel zooms only with Ctrl/Cmd, see below; otherwise the buttons, a double click or two fingers
            scrollWheelZoom: true,
            dragging: !window.matchMedia("(pointer: coarse)").matches,
            minZoom: 2,
        });
        // without the key the page keeps scrolling over the map
        const removeWheelZoom = zoomWithModifierWheel(containerRef.current);
        mapRef.current = map;
        return () => {
            removeWheelZoom();
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || pins.length === 0) return;

        const routes = lines.map((line) => L.polyline(line.map(toLatLng), { className: "travel-route", interactive: false }));
        const markers = pins.map(({ folder, stop, icon, popup }) => {
            const title = stop.name && stop.name !== folder.name ? `${stop.name} · ${folder.name}` : folder.name;
            return L.marker(toLatLng(stop), { icon: pinIcon(icon), title, alt: title })
                .bindPopup(popup, { className: "travel-map-popup", closeButton: false, minWidth: 200, maxWidth: 200 });
        });
        const layer = L.layerGroup([...routes, ...markers]).addTo(map);

        if (pins.length === 1) {
            map.setView(toLatLng(pins[0].stop), 6);
        } else {
            map.fitBounds(L.latLngBounds(pins.map((pin) => toLatLng(pin.stop))), {
                // more room at the top, where the pins stick out of their place
                paddingTopLeft: [48, 72],
                paddingBottomRight: [48, 40],
                maxZoom: 7,
            });
        }
        return () => {
            layer.remove();
        };
    }, [pins, lines]);

    return (
        <>
            <div ref={containerRef} className="travel-map" role="region" aria-label="Karte mit den Reisen" />
            {pins.map(({ key, icon }) => createPortal(<MapPin size={32} aria-hidden="true" />, icon, `pin-${key}`))}
            {pins.map(({ key, folder, stop, popup }) =>
                createPortal(<TravelMapCard folder={folder} stopName={stop.name} />, popup, `popup-${key}`)
            )}
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
