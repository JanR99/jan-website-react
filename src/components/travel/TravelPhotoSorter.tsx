import { useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight, GripVertical } from "lucide-react";
import TravelController from "../../controller/TravelController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { storeTravelFolder } from "../../hooks/useTravelFolders";
import { TravelFolder, TravelPhoto } from "../../types/Travel";
import { moveItem, photoDescription } from "../../utils/travel";

/** how far the pointer has to move before a pressed photo is dragged, in pixels */
const DRAG_START = 6;
/** dragging a photo this close to the top or bottom of the window scrolls the page, in pixels */
const SCROLL_EDGE = 110;

/** The photo that is pressed or dragged right now. */
interface Drag {
    photoId: number;
    pointerId: number;
    element: HTMLElement;
    /** where the pointer is in the window; where it was pressed while the photo is not dragged yet */
    x: number;
    y: number;
    /** where on the photo the pointer took hold of it */
    grabX: number;
    grabY: number;
    /** false while the photo is only pressed and has not been moved far enough */
    dragged: boolean;
    /** the order with the dragged photo where it is held right now */
    order: TravelPhoto[];
    /** true from a change of that order until the page shows it: until then the other photos are still at their old places */
    settling: boolean;
}

/** Moves the dragged photo below the pointer. Its own place in the grid may have changed, so that is measured again. */
function place(drag: Drag, grid: HTMLElement) {
    const origin = grid.getBoundingClientRect();
    const left = origin.left + grid.clientLeft + drag.element.offsetLeft;
    const top = origin.top + grid.clientTop + drag.element.offsetTop;
    drag.element.style.transform = `translate(${drag.x - drag.grabX - left}px, ${drag.y - drag.grabY - top}px)`;
}

/**
 * The photos of a folder for an admin to put into a new order: by dragging a photo to its place, or one
 * place at a time with the arrows. Nothing is saved before "Fertig".
 *
 * While a photo is dragged the elements stay where they are in the page and only their CSS order
 * changes, so the dragged one is never taken out of the page, which would end the dragging.
 */
export default function TravelPhotoSorter({ folder, onClose }: { folder: TravelFolder; onClose: () => void }) {
    const [order, setOrder] = useState<TravelPhoto[]>(folder.photos);
    /** the order shown while a photo is dragged, null otherwise */
    const [preview, setPreview] = useState<TravelPhoto[] | null>(null);
    const [draggedId, setDraggedId] = useState<number | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const gridRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<Drag | null>(null);

    // the other photos have moved to their new places, and with them the place of the dragged one
    useLayoutEffect(() => {
        const drag = dragRef.current;
        if (!drag?.dragged || !gridRef.current) return;
        drag.settling = false;
        place(drag, gridRef.current);
    }, [preview]);

    /** Keeps the dragged photo below the pointer and gives it the place of the photo it is held over. */
    function follow(drag: Drag) {
        const grid = gridRef.current;
        if (!grid) return;
        place(drag, grid);
        if (drag.settling) return;

        const over = document.elementsFromPoint(drag.x, drag.y)
            .map((element) => element.closest<HTMLElement>("[data-photo-id]"))
            .find((tile) => tile && tile !== drag.element && grid.contains(tile));
        if (!over) return;
        const from = drag.order.findIndex((photo) => photo.id === drag.photoId);
        const to = drag.order.findIndex((photo) => String(photo.id) === over.dataset.photoId);
        if (from < 0 || to < 0 || from === to) return;
        drag.order = moveItem(drag.order, from, to);
        drag.settling = true;
        setPreview(drag.order);
    }

    /** Runs once per frame while a photo is dragged; also covers the page being scrolled below the pointer. */
    function frame(drag: Drag) {
        // ends with the dragging, and if the page is left in the middle of it
        if (dragRef.current !== drag || !drag.element.isConnected) return;
        const aboveEdge = SCROLL_EDGE - drag.y;
        const belowEdge = drag.y - (window.innerHeight - SCROLL_EDGE);
        if (aboveEdge > 0) window.scrollBy({ top: -Math.ceil(aboveEdge / 6), behavior: "instant" });
        else if (belowEdge > 0) window.scrollBy({ top: Math.ceil(belowEdge / 6), behavior: "instant" });
        follow(drag);
        requestAnimationFrame(() => frame(drag));
    }

    function press(event: ReactPointerEvent<HTMLDivElement>, photoId: number) {
        if (busy || dragRef.current || event.button !== 0) return;
        const target = event.target as Element;
        // the arrows are buttons of their own
        if (target.closest("button")) return;
        // a finger on the photo scrolls the page, so it drags by the handle only
        if (event.pointerType !== "mouse" && !target.closest(".photo-sorter-handle")) return;

        const element = event.currentTarget;
        const box = element.getBoundingClientRect();
        // all further events of this pointer come to the photo, wherever the pointer goes
        element.setPointerCapture(event.pointerId);
        // otherwise the mouse marks text on its way
        event.preventDefault();
        dragRef.current = {
            photoId,
            pointerId: event.pointerId,
            element,
            x: event.clientX,
            y: event.clientY,
            grabX: event.clientX - box.left,
            grabY: event.clientY - box.top,
            dragged: false,
            order,
            settling: false,
        };
    }

    function move(event: ReactPointerEvent<HTMLDivElement>) {
        const drag = dragRef.current;
        if (!drag || event.pointerId !== drag.pointerId) return;
        if (!drag.dragged) {
            if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < DRAG_START) return;
            drag.dragged = true;
            setDraggedId(drag.photoId);
            setPreview(drag.order);
            requestAnimationFrame(() => frame(drag));
        }
        drag.x = event.clientX;
        drag.y = event.clientY;
        follow(drag);
    }

    /** @param keep whether the photo stays where it was dragged to */
    function release(event: ReactPointerEvent<HTMLDivElement>, keep: boolean) {
        const drag = dragRef.current;
        if (!drag || event.pointerId !== drag.pointerId) return;
        dragRef.current = null;
        drag.element.style.transform = "";
        if (drag.element.hasPointerCapture(drag.pointerId)) {
            drag.element.releasePointerCapture(drag.pointerId);
        }
        if (!drag.dragged) return;
        if (keep) setOrder(drag.order);
        setDraggedId(null);
        setPreview(null);
    }

    async function save() {
        const photoIds = order.map((photo) => photo.id);
        if (photoIds.every((id, index) => id === folder.photos[index]?.id)) {
            onClose();
            return;
        }
        setBusy(true);
        setError(null);
        try {
            storeTravelFolder(await TravelController.setPhotoOrder(folder.id, photoIds));
            onClose();
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setBusy(false);
        }
    }

    const shown = preview ?? order;
    const placeOf = new Map(shown.map((photo, index) => [photo.id, index]));

    return (
        <div>
            <p className="muted photo-sorter-hint">
                Zieh ein Foto an seinen neuen Platz oder verschieb es mit den Pfeilen.
                Das erste Foto ist das Titelbild des Ordners.
            </p>

            <div className="photo-sorter" ref={gridRef}>
                {/* in the order they have in the page; while one is dragged only the CSS order changes */}
                {order.map((photo) => {
                    const index = placeOf.get(photo.id) ?? 0;
                    return (
                        <div
                            key={photo.id}
                            data-photo-id={photo.id}
                            className={`photo-sorter-item${photo.id === draggedId ? " is-dragged" : ""}`}
                            style={{ order: index }}
                            onPointerDown={(event) => press(event, photo.id)}
                            onPointerMove={move}
                            onPointerUp={(event) => release(event, true)}
                            onPointerCancel={(event) => release(event, false)}
                        >
                            <img
                                src={TravelController.photoUrl(photo.id)}
                                alt={photoDescription(folder.name, photo, index)}
                                draggable={false}
                                loading="lazy"
                            />
                            <span className="photo-sorter-number">{index + 1}</span>
                            <span className="photo-sorter-handle" aria-hidden="true">
                                <GripVertical size={18} />
                            </span>
                            <div className="photo-sorter-moves">
                                <button
                                    type="button"
                                    className="gallery-action"
                                    onClick={() => setOrder(moveItem(order, index, index - 1))}
                                    disabled={busy || index === 0}
                                    aria-label={`Foto ${index + 1} eins nach vorne`}
                                    title="Eins nach vorne"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    className="gallery-action"
                                    onClick={() => setOrder(moveItem(order, index, index + 1))}
                                    disabled={busy || index === shown.length - 1}
                                    aria-label={`Foto ${index + 1} eins nach hinten`}
                                    title="Eins nach hinten"
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="photo-sorter-bar">
                {error && <p className="form-message form-message--error" role="alert">{error}</p>}
                <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={busy}>
                    Abbrechen
                </button>
                <button type="button" className="btn btn-sm" onClick={save} disabled={busy || draggedId !== null}>
                    {busy ? "Speichern …" : "Fertig"}
                </button>
            </div>
        </div>
    );
}
