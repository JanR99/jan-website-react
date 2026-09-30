import { useEffect, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import ImageController from "../../controller/ImageController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { resizeRecipeImage } from "../../utils/resizeImage";
import { ImageUp, LoaderCircle } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
// only the input; it is scaled down before the upload
const MAX_SIZE_MB = 60;

interface RecipeImageDropzoneProps {
    /** URL of the current image, null if there is none yet */
    previewUrl: string | null;
    onUploaded: (image: string) => void;
    onBusyChange: (busy: boolean) => void;
}

export default function RecipeImageDropzone({ previewUrl, onUploaded, onBusyChange }: RecipeImageDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [status, setStatus] = useState<"idle" | "resizing" | "uploading">("idle");
    const uploading = status !== "idle";
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // release the temporary object URL when it is replaced or the editor closes
    useEffect(() => () => {
        if (localPreview) URL.revokeObjectURL(localPreview);
    }, [localPreview]);

    async function upload(file: File) {
        setError(null);
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError("Bitte ein JPEG-, PNG- oder WebP-Bild verwenden.");
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`Das Bild darf höchstens ${MAX_SIZE_MB} MB groß sein.`);
            return;
        }

        setStatus("resizing");
        onBusyChange(true);
        try {
            let resized;
            try {
                resized = await resizeRecipeImage(file);
            } catch {
                setError("Das Bild konnte nicht gelesen werden.");
                return;
            }
            setLocalPreview(URL.createObjectURL(resized));
            setStatus("uploading");
            const result = await ImageController.uploadImage(resized);
            onUploaded(result.image);
        } catch (err) {
            setError(handleApiError(err));
            setLocalPreview(null);
        } finally {
            setStatus("idle");
            onBusyChange(false);
        }
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file && !uploading) void upload(file);
    }

    function handleKey(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
        }
    }

    const shown = localPreview ?? previewUrl;

    return (
        <div className="field">
            Bild
            <div
                className={`image-dropzone${dragging ? " is-dragging" : ""}${shown ? " has-image" : ""}`}
                role="button"
                tabIndex={0}
                aria-label="Bild hochladen: hierher ziehen oder klicken"
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
                {shown && <img src={shown} alt="" />}
                <div className="image-dropzone-overlay">
                    {uploading ? (
                        <>
                            <LoaderCircle size={26} className="image-dropzone-spin" />
                            <span>{status === "resizing" ? "Wird verkleinert …" : "Wird hochgeladen …"}</span>
                        </>
                    ) : (
                        <>
                            <ImageUp size={26} />
                            <span>{shown ? "Neues Bild hierher ziehen oder klicken" : "Bild hierher ziehen oder klicken"}</span>
                            <span className="image-dropzone-hint">JPEG, PNG oder WebP, max. {MAX_SIZE_MB} MB</span>
                        </>
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    hidden
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) void upload(file);
                    }}
                />
            </div>
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
        </div>
    );
}
