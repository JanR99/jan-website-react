export interface Recipe {
    title: string;
    image: string;
    defaultPortions?: number;
    ingredients?: any[];
    preparation?: string[];
    cuisine?: string;
    tags?: string[];
}