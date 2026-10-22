import type { CSSProperties } from "react";
import { lot } from "../../utils/chance";

const PIECES = 70;
const COLORS = ["var(--color-accent)", "var(--color-success)", "#f2c94c", "#5b8def", "#e5598a"];

/** Confetti falling once over the whole screen; pure CSS, gone after a few seconds, left out with reduced motion. */
export default function Confetti() {
    return (
        <div className="confetti" aria-hidden="true">
            {Array.from({ length: PIECES }, (_, i) => (
                <span
                    key={i}
                    className="confetti-piece"
                    style={{
                        "--x": `${lot(1, i) * 100}vw`,
                        "--drift": `${(lot(2, i) - 0.5) * 30}vw`,
                        "--spin": `${(lot(3, i) - 0.5) * 1440}deg`,
                        "--delay": `${lot(4, i) * 0.6}s`,
                        "--duration": `${2.2 + lot(5, i) * 1.6}s`,
                        "--size": `${6 + lot(6, i) * 6}px`,
                        "--color": COLORS[i % COLORS.length],
                    } as CSSProperties}
                />
            ))}
        </div>
    );
}
