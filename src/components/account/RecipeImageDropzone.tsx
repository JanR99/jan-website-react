import { useEffect, useState } from "react";
import ImageController from "../../controller/ImageController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { imageInputProblem, MAX_IMAGE_INPUT_MB, useFileDrop } from "../../hooks/useFileDrop";
import { resizeRecipeImage } from "../../utils/resizeImage";
import { ImageUp, LoaderCircle } from "lucide-react";

interface RecipeImageDropzoneProps {
    /** URL of the current image, null if there is none yet */
    previewUrl: string | null;
    onUploaded: (image: string) => void;
    onBusyChange: (busy: boolean) => void;
}

export default function RecipeImageDropzone({ previewUrl, onUploaded, onBusyChange }: RecipeImageDropzoneProps) {
    const [status, setStatus] = useState<"idle" | "resizing" | "uploading">("idle");
    const uploading = status !== "idle";
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { dragging, zoneProps, inputProps } = useFileDrop({
        busy: uploading,
        onFiles: (files) => void upload(files[0]),
    });

    // release the temporary object URL when it is replaced or the editor closes
    useEffect(() => () => {
        if (localPreview) URL.revokeObjectURL(localPreview);
    }, [localPreview]);

    async function upload(file: File) {
        setError(null);
        const problem = imageInputProblem(file);
        if (problem === "type") {
            setError("Bitte ein JPEG-, PNG- oder WebP-Bild verwenden.");
            return;
        }
        if (problem === "size") {
            setError(`Das Bild darf höchstens ${MAX_IMAGE_INPUT_MB} MB groß sein.`);
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

    const shown = localPreview ?? previewUrl;

    return (
        <div className="field">
            Bild
            <div
                className={`image-dropzone${dragging ? " is-dragging" : ""}${shown ? " has-image" : ""}`}
                aria-label="Bild hochladen: hierher ziehen oder klicken"
                {...zoneProps}
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
                            <span className="image-dropzone-hint">JPEG, PNG oder WebP, max. {MAX_IMAGE_INPUT_MB} MB</span>
                        </>
                    )}
                </div>
                <input {...inputProps} />
            </div>
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
        </div>
    );
}
