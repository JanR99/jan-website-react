import type { CSSProperties } from "react";

const PIECES = 70;
const COLORS = ["var(--color-accent)", "var(--color-success)", "#f2c94c", "#5b8def", "#e5598a"];

/** A number from 0 to 1 that looks random but is always the same for the same piece, so rendering stays pure. */
function lot(piece: number, salt: number): number {
    const mixed = Math.sin(piece * 12.9898 + salt * 78.233) * 43758.5453;
    return mixed - Math.floor(mixed);
}

/** Confetti falling once over the whole screen; pure CSS, gone after a few seconds, left out with reduced motion. */
export default function Confetti() {
    return (
        <div className="confetti" aria-hidden="true">
            {Array.from({ length: PIECES }, (_, i) => (
                <span
                    key={i}
                    className="confetti-piece"
                    style={{
                        "--x": `${lot(i, 1) * 100}vw`,
                        "--drift": `${(lot(i, 2) - 0.5) * 30}vw`,
                        "--spin": `${(lot(i, 3) - 0.5) * 1440}deg`,
                        "--delay": `${lot(i, 4) * 0.6}s`,
                        "--duration": `${2.2 + lot(i, 5) * 1.6}s`,
                        "--size": `${6 + lot(i, 6) * 6}px`,
                        "--color": COLORS[i % COLORS.length],
                    } as CSSProperties}
                />
            ))}
        </div>
    );
}
