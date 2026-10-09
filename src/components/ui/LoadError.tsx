import type { CSSProperties } from "react";
import { CloudOff } from "lucide-react";

interface Props {
    /** what couldn't be loaded, like "Die Rezepte konnten nicht geladen werden." */
    message: string;
    onRetry: () => void;
    style?: CSSProperties;
}

/** Stands in for the content of a page that couldn't be loaded, with a way to try again. */
export default function LoadError({ message, onRetry, style }: Props) {
    return (
        <div className="card empty-state" style={style} role="alert">
            <span className="empty-state-icon"><CloudOff size={26} /></span>
            <h3>Das hat gerade nicht geklappt</h3>
            <p>{message}</p>
            <button type="button" className="btn" onClick={onRetry}>
                Erneut versuchen
            </button>
        </div>
    );
}
