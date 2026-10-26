/** Pages that aren't counted: the account and the password reset are nothing a visitor looks at. */
const NOT_COUNTED = ["/konto", "/passwort-zuruecksetzen"];

/** What the backend takes as a page: lower case letters, digits, "-", "_" and "/". */
const PAGE = /^\/[a-z0-9_/-]{0,99}$/;

/** Counted for every address that isn't a page of the website, like a mistyped one. */
export const OTHER_PAGE = "/andere";

/**
 * The page an address is counted as, null for one that isn't counted. A recipe counts by its id, so
 * "/cookbook/12-falafel-wrap" and "/cookbook/12" are the same page, also after the recipe was renamed.
 */
export function statsPage(pathname: string): string | null {
    const path = pathname.toLowerCase().replace(/\/+$/, "") || "/";
    if (NOT_COUNTED.some((page) => path === page || path.startsWith(`${page}/`))) return null;
    const recipe = /^\/cookbook\/(\d+)(-|$)/.exec(path);
    if (recipe) return `/cookbook/${recipe[1]}`;
    return PAGE.test(path) ? path : OTHER_PAGE;
}
