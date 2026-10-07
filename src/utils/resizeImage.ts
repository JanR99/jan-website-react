/** Longest side in pixels and file size an image is scaled down to. */
interface Target {
    maxSide: number;
    maxBytes: number;
}

/** Uploaded images are stored in the Datastore, whose entities may be at most 1 MiB. */
const RECIPE_IMAGE: Target = { maxSide: 1600, maxBytes: 800 * 1024 };
/** One version for the gallery and the large view, so it has to stay small enough to load many of them. */
const TRAVEL_PHOTO: Target = { maxSide: 1600, maxBytes: 400 * 1024 };
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

function decode(file: File): Promise<ImageBitmap> {
    // "from-image" applies the EXIF rotation of phone photos; older browsers don't know the option
    return createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => createImageBitmap(file));
}

/**
 * Scales the image to at most target.maxSide on the longer side (smaller images are not enlarged)
 * and encodes it as JPEG of at most target.maxBytes: first the quality is lowered, then the size.
 */
async function scaleDown(bitmap: ImageBitmap, target: Target, name: string): Promise<File> {
    for (let side = target.maxSide; side >= 400; side = Math.round(side * 0.8)) {
        for (const quality of QUALITIES) {
            const blob = await encode(bitmap, side, quality);
            if (blob.size <= target.maxBytes) {
                return new File([blob], name, { type: "image/jpeg" });
            }
        }
    }
    throw new Error("Das Bild lässt sich nicht klein genug verkleinern.");
}

/** A recipe image: JPEG of at most 1600 px and 800 KB. */
export async function resizeRecipeImage(file: File): Promise<File> {
    const bitmap = await decode(file);
    try {
        return await scaleDown(bitmap, RECIPE_IMAGE, "image.jpg");
    } finally {
        bitmap.close();
    }
}

/** A travel photo: JPEG of at most 1600 px and 400 KB. */
export async function resizeTravelPhoto(file: File): Promise<File> {
    const bitmap = await decode(file);
    try {
        return await scaleDown(bitmap, TRAVEL_PHOTO, "image.jpg");
    } finally {
        bitmap.close();
    }
}
