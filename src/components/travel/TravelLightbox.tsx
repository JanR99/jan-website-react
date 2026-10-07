import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent, PointerEvent } from "react";
import { Check, ChevronLeft, ChevronRight, LoaderCircle, X } from "lucide-react";
import TravelController from "../../controller/TravelController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { storeTravelFolder } from "../../hooks/useTravelFolders";
import { TravelPhoto } from "../../types/Travel";
import { CAPTION_MAX_LENGTH, cleanCaption, photoDescription } from "../../utils/travel";

/** How far the finger has to move before the movement counts as a swipe and not as a tap. */
const SWIPE_START = 8;
/** Share of the width after which letting go shows the next photo ... */
const SWIPE_DISTANCE = 0.2;
/** ... or this speed in pixels per millisecond, for a short quick swipe. */
const SWIPE_SPEED = 0.4;
/** Before the first and after the last photo there is nothing: the photo follows only a little. */
const EDGE_RESISTANCE = 0.3;

interface Swipe {
    pointerId: number;
    startX: number;
    startY: number;
    startTime: number;
    /** false until it is clear that the movement goes sideways */
    active: boolean;
}

interface TravelLightboxProps {
    /** name of the folder, for the image descriptions */
    name: string;
    photos: TravelPhoto[];
    /** position of the shown photo in photos */
    index: number;
    /** lets the captions be changed */
    canManage: boolean;
    onIndexChange: (index: number) => void;
    onClose: () => void;
}

/** Buttons and arrow keys go around: after the last photo comes the first one. */
function around(index: number, delta: number, count: number): number {
    return (index + delta + count) % count;
}

function isZoomed(): boolean {
    return (window.visualViewport?.scale ?? 1) > 1.01;
}

/**
 * One photo of a folder in large, with its caption. The next one is reached by swiping
 * (the photo follows the finger), with the buttons or with the arrow keys.
 */
export default function TravelLightbox({ name, photos, index, canManage, onIndexChange, onClose }: TravelLightboxProps) {
    const count = photos.length;
    const photo = photos[index];

    const swipeRef = useRef<Swipe | null>(null);
    // letting go after a swipe with the mouse also is a click, which must not close the view
    const swipedRef = useRef(false);
    /** how far the photos are moved by the finger right now, null while nothing is being moved */
    const [dragX, setDragX] = useState<number | null>(null);
    /** whether the photos slide to their place or jump there */
    const [sliding, setSliding] = useState(false);
    const [captionError, setCaptionError] = useState<string | null>(null);
    // zoomed in with two fingers, moving sideways looks around in the photo instead of swiping
    const [zoomed, setZoomed] = useState(isZoomed);

    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;
        const update = () => setZoomed(isZoomed());
        viewport.addEventListener("resize", update);
        return () => viewport.removeEventListener("resize", update);
    }, []);

    function step(delta: number) {
        const next = around(index, delta, count);
        // from the last photo to the first one without sliding past all the others
        setSliding(Math.abs(next - index) === 1);
        onIndexChange(next);
    }

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // in the caption field the keys belong to the text
            if (e.target instanceof HTMLInputElement) return;
            if (e.key === "Escape") onClose();
            const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
            if (delta !== 0 && count > 1) {
                const next = around(index, delta, count);
                setSliding(Math.abs(next - index) === 1);
                onIndexChange(next);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [index, count, onIndexChange, onClose]);

    // the page behind must not scroll while the lightbox is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
        swipedRef.current = false;
        if (swipeRef.current && swipeRef.current.pointerId !== e.pointerId) {
            // a second finger: that is zooming, not swiping
            swipeRef.current = null;
            setSliding(true);
            setDragX(null);
            return;
        }
        if (count < 2 || zoomed || (e.pointerType === "mouse" && e.button !== 0)) return;
        swipeRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, startTime: e.timeStamp, active: false };
    }

    function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
        const swipe = swipeRef.current;
        if (!swipe || swipe.pointerId !== e.pointerId) return;
        if (e.pointerType === "mouse" && e.buttons === 0) {
            // the button was released somewhere else before the swipe had started
            swipeRef.current = null;
            return;
        }
        const dx = e.clientX - swipe.startX;
        const dy = e.clientY - swipe.startY;

        if (!swipe.active) {
            if (Math.abs(dx) < SWIPE_START && Math.abs(dy) < SWIPE_START) return;
            if (Math.abs(dy) > Math.abs(dx)) {
                // up or down: not a swipe
                swipeRef.current = null;
                return;
            }
            swipe.active = true;
            // from here on the movement belongs to the lightbox, also outside of it
            e.currentTarget.setPointerCapture(e.pointerId);
            // a caption that is being written is saved when its field loses the focus
            if (document.activeElement instanceof HTMLInputElement) document.activeElement.blur();
            setSliding(false);
        }

        const atEdge = (index === 0 && dx > 0) || (index === count - 1 && dx < 0);
        setDragX(atEdge ? dx * EDGE_RESISTANCE : dx);
    }

    /** The finger was lifted (or the browser took the movement over): on to the next photo or back to this one. */
    function handlePointerEnd(e: PointerEvent<HTMLDivElement>) {
        const swipe = swipeRef.current;
        if (!swipe || swipe.pointerId !== e.pointerId) return;
        swipeRef.current = null;
        if (!swipe.active) return;
        swipedRef.current = true;

        const dx = e.clientX - swipe.startX;
        const distance = Math.abs(dx);
        const speed = distance / Math.max(e.timeStamp - swipe.startTime, 1);
        const farEnough = distance > e.currentTarget.clientWidth * SWIPE_DISTANCE || (speed > SWIPE_SPEED && distance > 24);
        const next = index + (dx < 0 ? 1 : -1);

        setSliding(true);
        setDragX(null);
        if (e.type === "pointerup" && farEnough && next >= 0 && next < count) {
            onIndexChange(next);
        }
    }

    function handleStageClick(e: MouseEvent<HTMLDivElement>) {
        if (swipedRef.current) {
            swipedRef.current = false;
            return;
        }
        // next to the photo
        if (!(e.target instanceof HTMLImageElement)) onClose();
    }

    return (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Bildansicht">
            <div
                className={`lightbox-stage${zoomed ? " is-zoomed" : ""}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                onClick={handleStageClick}
            >
                <div
                    className={`lightbox-track${sliding && dragX === null ? " is-sliding" : ""}`}
                    style={{ transform: `translate3d(calc(${-index * 100}% + ${dragX ?? 0}px), 0, 0)` }}
                >
                    {/* only the shown photo and its neighbours, which are the ones a swipe can bring in */}
                    {photos.map((slide, i) => Math.abs(i - index) <= 1 && (
                        <div
                            key={slide.id}
                            className="lightbox-slide"
                            style={{ transform: `translateX(${i * 100}%)` }}
                            aria-hidden={i !== index}
                        >
                            <img
                                src={TravelController.photoUrl(slide.id)}
                                alt={photoDescription(name, slide, i)}
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="lightbox-footer">
                {canManage ? (
                    <TravelCaptionField key={photo.id} photo={photo} number={index + 1} onError={setCaptionError} />
                ) : (
                    photo.caption && <p className="lightbox-caption">{photo.caption}</p>
                )}
                {captionError && <p className="lightbox-error" role="alert">{captionError}</p>}
                <span className="lightbox-counter">{index + 1} / {count}</span>
            </div>

            <button type="button" className="lightbox-btn lightbox-close" onClick={onClose} aria-label="Schließen">
                <X size={20} />
            </button>
            {count > 1 && (
                <>
                    <button
                        type="button"
                        className="lightbox-btn lightbox-prev"
                        onClick={() => step(-1)}
                        aria-label="Vorheriges Bild"
                    >
                        <ChevronLeft size={26} />
                    </button>
                    <button
                        type="button"
                        className="lightbox-btn lightbox-next"
                        onClick={() => step(1)}
                        aria-label="Nächstes Bild"
                    >
                        <ChevronRight size={26} />
                    </button>
                </>
            )}
        </div>
    );
}

interface TravelCaptionFieldProps {
    photo: TravelPhoto;
    /** place of the photo in the folder, for messages */
    number: number;
    onError: (message: string | null) => void;
}

/**
 * The caption of the shown photo as a text field, for admins. It is saved when the field is left
 * (Enter, a click or a swipe elsewhere); Escape takes the changes back.
 */
function TravelCaptionField({ photo, number, onError }: TravelCaptionFieldProps) {
    const [draft, setDraft] = useState(photo.caption);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    // Escape leaves the field as well, but must not save
    const discardRef = useRef(false);
    const changed = cleanCaption(draft) !== photo.caption;

    async function save() {
        if (discardRef.current) {
            discardRef.current = false;
            return;
        }
        const caption = cleanCaption(draft);
        setDraft(caption);
        if (caption === photo.caption || saving) return;

        setSaving(true);
        setSaved(false);
        onError(null);
        try {
            storeTravelFolder(await TravelController.setCaption(photo.id, caption));
            setSaved(true);
        } catch (err) {
            onError(`Die Bildunterschrift von Foto ${number} wurde nicht gespeichert: ${handleApiError(err)}`);
        } finally {
            setSaving(false);
        }
    }

    function handleKey(e: ReactKeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        } else if (e.key === "Escape") {
            discardRef.current = true;
            setDraft(photo.caption);
            e.currentTarget.blur();
        }
    }

    return (
        <div className="lightbox-caption-field">
            <input
                className="input"
                value={draft}
                onChange={(e) => {
                    setDraft(e.target.value);
                    setSaved(false);
                }}
                onBlur={() => void save()}
                onKeyDown={handleKey}
                placeholder="Bildunterschrift hinzufügen …"
                aria-label={`Bildunterschrift für Foto ${number}`}
                maxLength={CAPTION_MAX_LENGTH}
                enterKeyHint="done"
            />
            <span className="lightbox-caption-status" role="status">
                {saving ? (
                    <><LoaderCircle size={16} className="travel-dropzone-spin" /> Speichert …</>
                ) : changed ? (
                    "Enter speichert · Esc verwirft"
                ) : saved ? (
                    <><Check size={16} /> Gespeichert</>
                ) : null}
            </span>
        </div>
    );
}
