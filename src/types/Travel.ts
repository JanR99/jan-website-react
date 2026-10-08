/** A point on the map, in degrees. */
export interface TravelPosition {
    latitude: number;
    longitude: number;
}

/** A place the trip went to; the stops of a folder are in the order of the trip. */
export interface TravelStop extends TravelPosition {
    /** like "Sevilla"; empty if the stop has none */
    name: string;
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
    /** the places of the trip in its order; empty if the folder has no place on the map */
    stops: TravelStop[];
    /** the folder the trip came from: the line on the map goes from its last stop to the first one here */
    previousFolderId: number | null;
    /** when the trip was, as year and month like "2024-05"; both null if that is not known */
    startMonth: string | null;
    /** null for a trip within one month */
    endMonth: string | null;
    /** what the diary says about the trip, paragraphs separated by an empty line; empty if there is none */
    text: string;
    /** the cuisine of the cookbook that belongs to the trip, like "japanisch"; empty if there is none */
    cuisine: string;
    photos: TravelPhoto[];
}

export interface TravelFolderRequest {
    name: string;
    country: string;
    /** empty for a folder without a place on the map */
    stops: TravelStop[];
    previousFolderId: number | null;
    /** year and month like "2024-05"; both null if it is not known when the trip was */
    startMonth: string | null;
    endMonth: string | null;
    /** a cuisine of the cookbook like "japanisch", whose recipes are shown with the trip; empty for none */
    cuisine: string;
}
