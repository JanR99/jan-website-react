/** A folder of the travel diary (one per trip) with the ids of its photos in the order they are shown. */
export interface TravelFolder {
    id: number;
    name: string;
    /** empty if there is no country worth showing */
    country: string;
    /** photo shown on the folder, null while the folder is empty */
    coverPhotoId: number | null;
    photoIds: number[];
}

export interface TravelFolderRequest {
    name: string;
    country: string;
}
