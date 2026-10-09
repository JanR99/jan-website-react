import { useCallback, useEffect, useRef, useState } from "react";

const snapshot = (input: unknown) => JSON.stringify(input);

/**
 * For a form whose input is lost when it is closed. As long as the input differs from what the form
 * was opened with, closing asks first, and the browser asks before the page is reloaded or closed.
 *
 * @param input everything the user can enter in the form, e.g. { title, text }
 * @returns asks if needed and tells whether the input may go; it stays the same function, so it can
 *          be handed to a dialog without making that start over
 */
export function useUnsavedChanges(input: unknown): () => boolean {
    const [opened] = useState(() => snapshot(input));
    const changed = snapshot(input) !== opened;
    const changedRef = useRef(changed);

    useEffect(() => {
        changedRef.current = changed;
        if (!changed) return;

        const ask = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", ask);
        return () => window.removeEventListener("beforeunload", ask);
    }, [changed]);

    return useCallback(() => !changedRef.current || window.confirm("Änderungen verwerfen?"), []);
}
