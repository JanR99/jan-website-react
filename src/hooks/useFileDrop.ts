import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, KeyboardEvent } from "react";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
// only the input; images are scaled down in the browser before the upload
export const MAX_IMAGE_INPUT_MB = 60;

/** Why a picked file can't be used as an image, null if it can. */
export function imageInputProblem(file: File): "type" | "size" | null {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "type";
    if (file.size > MAX_IMAGE_INPUT_MB * 1024 * 1024) return "size";
    return null;
}

/**
 * A drop zone for image files: drag & drop, click or Enter/Space opens the file dialog.
 * Spread `zoneProps` on the zone and `inputProps` on a hidden file input inside it.
 * While `busy`, clicks and drops are ignored.
 */
export function useFileDrop({ multiple = false, busy, onFiles }: {
    multiple?: boolean;
    busy: boolean;
    onFiles: (files: File[]) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    function pick(files: File[]) {
        if (files.length > 0 && !busy) onFiles(multiple ? files : files.slice(0, 1));
    }

    const zoneProps = {
        role: "button",
        tabIndex: 0,
        "aria-busy": busy,
        onClick: () => !busy && inputRef.current?.click(),
        onKeyDown: (event: KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inputRef.current?.click();
            }
        },
        onDragEnter: (event: DragEvent) => { event.preventDefault(); setDragging(true); },
        onDragOver: (event: DragEvent) => event.preventDefault(),
        onDragLeave: (event: DragEvent) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
        },
        onDrop: (event: DragEvent) => {
            event.preventDefault();
            setDragging(false);
            pick(Array.from(event.dataTransfer.files ?? []));
        },
    };

    const inputProps = {
        ref: inputRef,
        type: "file",
        accept: ACCEPTED_IMAGE_TYPES.join(","),
        multiple,
        hidden: true,
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            pick(files);
        },
    };

    return { dragging, zoneProps, inputProps };
}
