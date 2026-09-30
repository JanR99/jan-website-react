/** Uploaded images are stored in the Datastore, whose entities may be at most 1 MiB. */
const MAX_BYTES = 800 * 1024;
const MAX_SIDE = 1600;
const QUALITIES = [0.85, 0.75, 0.65, 0.55];

function encode(bitmap: ImageBitmap, maxSide: number, quality: number): Promise<Blob> {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return Promise.reject(new Error("Canvas wird nicht unterstützt."));

    // JPEG has no transparency, so transparent areas (PNG/WebP) become white
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    return new Promise((resolve, reject) =>
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Das Bild konnte nicht umgewandelt werden."))),
            "image/jpeg",
            quality
        )
    );
}

/**
 * Scales a recipe image to at most 1600 px on the longer side (smaller images are not enlarged)
 * and encodes it as JPEG of at most 800 KB: first the quality is lowered, then the size.
 */
export async function resizeRecipeImage(file: File): Promise<File> {
    // "from-image" applies the EXIF rotation of phone photos; older browsers don't know the option
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
        .catch(() => createImageBitmap(file));
    try {
        for (let side = MAX_SIDE; side >= 400; side = Math.round(side * 0.8)) {
            for (const quality of QUALITIES) {
                const blob = await encode(bitmap, side, quality);
                if (blob.size <= MAX_BYTES) {
                    return new File([blob], "image.jpg", { type: "image/jpeg" });
                }
            }
        }
        throw new Error("Das Bild lässt sich nicht klein genug verkleinern.");
    } finally {
        bitmap.close();
    }
}
