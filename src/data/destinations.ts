export interface Destination {
    name: string;
    country: string;
    imageCount: number;
}

export const destinations: Destination[] = [
    { name: "Andorra", country: "Andorra", imageCount: 4 },
    { name: "Porto", country: "Portugal", imageCount: 4 },
    { name: "Prag", country: "Tschechien", imageCount: 4 },
    { name: "Spanien", country: "Spanien", imageCount: 4 },
];

const BASE = import.meta.env.BASE_URL;

export const destinationThumbnail = (name: string, index: number) =>
    `${BASE}Bilder/Urlaub-thumbnail/${name}${index}-min.jpg`;

export const destinationImage = (name: string, index: number) =>
    `${BASE}Bilder/Urlaub-normal/${name}${index}.jpg`;

export const findDestination = (name: string | undefined) =>
    destinations.find((d) => d.name.toLowerCase() === name?.toLowerCase());
