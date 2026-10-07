/** A point on the map, in degrees. */
export interface TravelPosition {
    latitude: number;
    longitude: number;
}

/** A place the place search found. */
export interface PlaceSearchResult extends TravelPosition {
    label: string;
}

/** A photo of a folder; the image itself is loaded by the id. */
export interface TravelPhoto {
    id: number;
    /** shown below the photo in the large view; empty if the photo has none */
    caption: string;
}

/** A folder of the travel diary (one per trip) with its photos in the order they are shown. */
export interface TravelFolder {
    id: number;
    name: string;
    /** empty if there is no country worth showing */
    country: string;
    /** photo shown on the folder, null while the folder is empty */
    coverPhotoId: number | null;
    /** where the trip is shown on the map; both null if the folder has no place on it */
    latitude: number | null;
    longitude: number | null;
    photos: TravelPhoto[];
}

export interface TravelFolderRequest {
    name: string;
    country: string;
    /** both null for a folder without a place on the map */
    latitude: number | null;
    longitude: number | null;
}
