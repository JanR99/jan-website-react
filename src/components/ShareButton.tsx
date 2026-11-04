import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { pageUrl, shareLink } from "../utils/share";

const LABELS = { shared: "Teilen", copied: "Link kopiert", failed: "Teilen nicht möglich" };

/** Shares the page at `path`; without a share menu the button says for a moment whether the link was copied. */
export default function ShareButton({ title, path }: { title: string; path: string }) {
    const [result, setResult] = useState<keyof typeof LABELS>("shared");

    const share = async () => {
        const outcome = await shareLink(title, pageUrl(path));
        if (outcome !== "shared") {
            setResult(outcome);
            setTimeout(() => setResult("shared"), 2000);
        }
    };

    return (
        <button type="button" className="btn btn-secondary" onClick={() => void share()}>
            {result === "copied" ? <Check size={18} /> : <Share2 size={18} />}
            <span aria-live="polite">{LABELS[result]}</span>
        </button>
    );
}
