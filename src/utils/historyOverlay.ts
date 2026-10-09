/** What the history entry of an opened view carries: which view it is and what it was opened with. */
interface OpenedOverlay {
    name: string;
    value: unknown;
}

/**
 * The state for the history entry of a view that lies over a page (photo view, cook mode).
 * Whatever the entry of the page itself carried stays, since the page is still shown behind the view.
 */
export const withOverlay = (state: unknown, name: string, value: unknown): object => ({
    ...(typeof state === "object" ? state : null),
    overlay: { name, value } satisfies OpenedOverlay,
});

/** The view with this name, if the history entry is the one it was opened with. */
export function openedOverlay(state: unknown, name: string): OpenedOverlay | undefined {
    const overlay = (state as { overlay?: Partial<OpenedOverlay> } | null)?.overlay;
    return overlay?.name === name ? { name, value: overlay.value } : undefined;
}
