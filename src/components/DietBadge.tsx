import { Leaf } from "lucide-react";
import { isVegan, isVegetarian } from "../utils/recipe";

/** "vegan" or "vegetarisch" as a green badge; nothing for other recipes. */
export default function DietBadge({ recipe }: { recipe: Recipe }) {
    if (!isVegetarian(recipe)) return null;
    return <span className="badge badge--green"><Leaf size={12} /> {isVegan(recipe) ? "vegan" : "vegetarisch"}</span>;
}
