import { useState } from "react";
import TravelController from "../../controller/TravelController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { imageInputProblem, MAX_IMAGE_INPUT_MB, useFileDrop } from "../../hooks/useFileDrop";
import { storeTravelFolder } from "../../hooks/useTravelFolders";
import { resizeTravelPhoto } from "../../utils/resizeImage";
import { ImageUp, LoaderCircle } from "lucide-react";

interface Progress {
    done: number;
    total: number;
}

/** Lets an admin add photos to a folder: several at once, by drag & drop or from the file dialog. */
export default function TravelPhotoDropzone({ folderId }: { folderId: number }) {
    const [progress, setProgress] = useState<Progress | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const uploading = progress !== null;
    const { dragging, zoneProps, inputProps } = useFileDrop({
        multiple: true,
        busy: uploading,
        onFiles: (files) => void upload(files),
    });

    async function uploadOne(file: File): Promise<string | null> {
        const problem = imageInputProblem(file);
        if (problem === "type") {
            return "kein JPEG-, PNG- oder WebP-Bild";
        }
        if (problem === "size") {
            return `größer als ${MAX_IMAGE_INPUT_MB} MB`;
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

    return (
        <div className="travel-upload">
            <div
                className={`travel-dropzone${dragging ? " is-dragging" : ""}`}
                aria-label="Fotos hochladen: hierher ziehen oder klicken"
                {...zoneProps}
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
                            Mehrere auf einmal möglich · JPEG, PNG oder WebP, je max. {MAX_IMAGE_INPUT_MB} MB
                        </span>
                    </>
                )}
                <input {...inputProps} />
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
