import { useRef, useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import TravelController from "../../controller/TravelController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { storeTravelFolder } from "../../hooks/useTravelFolders";
import { resizeTravelPhoto } from "../../utils/resizeImage";
import { ImageUp, LoaderCircle } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
// only the input; every photo is scaled down before the upload
const MAX_SIZE_MB = 60;

interface Progress {
    done: number;
    total: number;
}

/** Lets an admin add photos to a folder: several at once, by drag & drop or from the file dialog. */
export default function TravelPhotoDropzone({ folderId }: { folderId: number }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState<Progress | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const uploading = progress !== null;

    async function uploadOne(file: File): Promise<string | null> {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            return "kein JPEG-, PNG- oder WebP-Bild";
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return `größer als ${MAX_SIZE_MB} MB`;
        }
        let resized;
        try {
            resized = await resizeTravelPhoto(file);
        } catch {
            return "konnte nicht gelesen werden";
        }
        try {
            storeTravelFolder(await TravelController.uploadPhoto(folderId, resized));
            return null;
        } catch (err) {
            return handleApiError(err);
        }
    }

    /** One after the other, so the photos keep their order and the backend isn't flooded. */
    async function upload(files: File[]) {
        if (files.length === 0 || uploading) return;
        setErrors([]);
        const failed: string[] = [];
        for (let i = 0; i < files.length; i++) {
            setProgress({ done: i, total: files.length });
            const error = await uploadOne(files[i]);
            if (error) failed.push(`${files[i].name}: ${error}`);
        }
        setProgress(null);
        setErrors(failed);
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        setDragging(false);
        void upload(Array.from(event.dataTransfer.files ?? []));
    }

    function handleKey(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
        }
    }

    return (
        <div className="travel-upload">
            <div
                className={`travel-dropzone${dragging ? " is-dragging" : ""}`}
                role="button"
                tabIndex={0}
                aria-label="Fotos hochladen: hierher ziehen oder klicken"
                aria-busy={uploading}
                onClick={() => !uploading && inputRef.current?.click()}
                onKeyDown={handleKey}
                onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
                }}
                onDrop={handleDrop}
            >
                {progress ? (
                    <>
                        <LoaderCircle size={26} className="travel-dropzone-spin" />
                        <span role="status">
                            Foto {progress.done + 1} von {progress.total} wird hochgeladen …
                        </span>
                    </>
                ) : (
                    <>
                        <ImageUp size={26} />
                        <span>Fotos hierher ziehen oder klicken</span>
                        <span className="travel-dropzone-hint">
                            Mehrere auf einmal möglich · JPEG, PNG oder WebP, je max. {MAX_SIZE_MB} MB
                        </span>
                    </>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    multiple
                    hidden
                    onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        e.target.value = "";
                        void upload(files);
                    }}
                />
            </div>
            {errors.length > 0 && (
                <div className="form-message form-message--error" role="alert">
                    {errors.length === 1 ? "Ein Foto wurde nicht hochgeladen:" : `${errors.length} Fotos wurden nicht hochgeladen:`}
                    <ul className="travel-upload-errors">
                        {errors.map((error) => <li key={error}>{error}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
}
