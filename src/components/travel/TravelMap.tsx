import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import L from "leaflet";
import TravelController from "../../controller/TravelController";
import { TravelFolder } from "../../types/Travel";
import { folderPosition, folderSubtitle, photoCountLabel, travelFolderPath } from "../../utils/travel";
import { createMap, pinIcon, toLatLng } from "./leafletMap";
import { zoomWithModifierWheel } from "./modifierWheelZoom";

/**
 * The map of the travel diary: a pin for every folder that has a place; a click on it shows the folder
 * and leads into it. Loaded on demand (React.lazy), so Leaflet is only fetched where a map is shown.
 */
export default function TravelMap({ folders }: { folders: TravelFolder[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    // Leaflet owns the markers and popups; React renders their content into these elements
    const pins = useMemo(
        () =>
            folders.flatMap((folder) => {
                const position = folderPosition(folder);
                return position
                    ? [{ folder, position, icon: document.createElement("span"), popup: document.createElement("div") }]
                    : [];
            }),
        [folders]
    );

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

        const markers = pins.map(({ folder, position, icon, popup }) =>
            L.marker(toLatLng(position), { icon: pinIcon(icon), title: folder.name, alt: folder.name })
                .bindPopup(popup, { className: "travel-map-popup", closeButton: false, minWidth: 200, maxWidth: 200 })
        );
        const layer = L.layerGroup(markers).addTo(map);

        if (pins.length === 1) {
            map.setView(toLatLng(pins[0].position), 6);
        } else {
            map.fitBounds(L.latLngBounds(pins.map((pin) => toLatLng(pin.position))), {
                // more room at the top, where the pins stick out of their place
                paddingTopLeft: [48, 72],
                paddingBottomRight: [48, 40],
                maxZoom: 7,
            });
        }
        return () => {
            layer.remove();
        };
    }, [pins]);

    return (
        <>
            <div ref={containerRef} className="travel-map" role="region" aria-label="Karte mit den Reisen" />
            {pins.map(({ folder, icon }) => createPortal(<MapPin size={32} aria-hidden="true" />, icon, `pin-${folder.id}`))}
            {pins.map(({ folder, popup }) => createPortal(<TravelMapCard folder={folder} />, popup, `popup-${folder.id}`))}
        </>
    );
}

/** What the popup of a pin shows: the folder with its cover photo, as a link into it. */
function TravelMapCard({ folder }: { folder: TravelFolder }) {
    const subtitle = folderSubtitle(folder);

    return (
        <Link to={travelFolderPath(folder)} className="travel-map-card">
            {folder.coverPhotoId !== null && <img src={TravelController.photoUrl(folder.coverPhotoId)} alt="" />}
            <span className="travel-map-card-body">
                {subtitle && <span className="travel-map-card-country">{subtitle}</span>}
                <strong>{folder.name}</strong>
                <span className="travel-map-card-cta">
                    {photoCountLabel(folder.photos.length)} <ArrowRight size={14} />
                </span>
            </span>
        </Link>
    );
}
