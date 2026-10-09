import { useLocation, useNavigate } from "react-router-dom";
import { openedOverlay, withOverlay } from "../utils/historyOverlay";

/**
 * For a view that lies over a page, like the photo view or the cook mode: opening it adds an entry
 * to the browser history (with the same address), so the back button closes the view instead of
 * leaving the page. Closing it another way goes that step back, so no entry is left over.
 *
 * @param name tells the views of a page apart
 */
export function useHistoryOverlay<T = true>(name: string) {
    const location = useLocation();
    const navigate = useNavigate();
    const opened = openedOverlay(location.state, name);

    return {
        open: opened !== undefined,
        /** what the view was opened with, e.g. the photo; undefined while it is closed */
        value: opened?.value as T | undefined,
        show: (value: T) => {
            const { pathname, search, hash } = location;
            navigate({ pathname, search, hash }, { state: withOverlay(location.state, name, value) });
        },
        close: () => {
            if (opened) navigate(-1);
        },
    };
}
