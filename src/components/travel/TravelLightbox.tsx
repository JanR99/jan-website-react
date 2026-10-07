import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import TravelController from "../../controller/TravelController";

interface TravelLightboxProps {
    /** name of the folder, for the image descriptions */
    name: string;
    photoIds: number[];
    /** position of the shown photo in photoIds */
    index: number;
    onIndexChange: (index: number) => void;
    onClose: () => void;
}

/** One photo of a folder in large, with buttons and arrow keys to go to the next one. */
export default function TravelLightbox({ name, photoIds, index, onIndexChange, onClose }: TravelLightboxProps) {
    const count = photoIds.length;
    const photoId = photoIds[index];
    const step = (delta: number) => onIndexChange((index + delta + count) % count);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") onIndexChange((index + 1) % count);
            if (e.key === "ArrowLeft") onIndexChange((index - 1 + count) % count);
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

    return (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Bildansicht" onClick={onClose}>
            <img
                key={photoId}
                src={TravelController.photoUrl(photoId)}
                alt={`${name} ${index + 1}`}
                onClick={(e) => e.stopPropagation()}
            />
            <button type="button" className="lightbox-btn lightbox-close" onClick={onClose} aria-label="Schließen">
                <X size={20} />
            </button>
            <button
                type="button"
                className="lightbox-btn lightbox-prev"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label="Vorheriges Bild"
            >
                <ChevronLeft size={26} />
            </button>
            <button
                type="button"
                className="lightbox-btn lightbox-next"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label="Nächstes Bild"
            >
                <ChevronRight size={26} />
            </button>
            <span className="lightbox-counter">{index + 1} / {count}</span>
        </div>
    );
}
