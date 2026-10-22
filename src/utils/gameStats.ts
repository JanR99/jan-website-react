/** Right answers as a share of the asked ones, in whole percent; "–" before the first one. */
export function hitRate(right: number, asked: number): string {
    return asked > 0 ? `${Math.round((right / asked) * 100)} %` : "–";
}

/** "1 Runde", "3 Runden". */
export const roundCount = (rounds: number) => `${rounds} ${rounds === 1 ? "Runde" : "Runden"}`;
