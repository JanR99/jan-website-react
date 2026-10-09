/**
 * Shows the stored copy of a list right away and the real answer as soon as it is there.
 * When the backend has to wake up first that takes several seconds, which the stored copy bridges.
 *
 * @param readStored the copy kept for offline use; null or failing when there is none
 * @param loadFresh the real answer from the backend
 * @param show called for the stored copy (when it is there before the real answer) and for the real answer
 * @returns whether the real answer arrived; false means only the stored copy is shown
 * @throws the error of loadFresh when there is no stored copy either
 */
export async function storedThenFresh<T>(
    readStored: () => Promise<T | null>,
    loadFresh: () => Promise<T>,
    show: (value: T) => void,
): Promise<boolean> {
    let freshArrived = false;
    const storedShown = readStored()
        .catch(() => null)
        .then((stored) => {
            // a stored copy that turns up after the real answer must not replace it
            if (stored === null || freshArrived) return false;
            show(stored);
            return true;
        });

    try {
        const fresh = await loadFresh();
        freshArrived = true;
        show(fresh);
        return true;
    } catch (err) {
        if (await storedShown) return false;
        throw err;
    }
}
