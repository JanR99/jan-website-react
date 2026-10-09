import { UserDTO } from "../../types/entities.ts";

const STORAGE_KEY = "jan-website-session";
const ONE_DAY = 24 * 60 * 60 * 1000;
const EXPIRY_WARNING = 5 * 60 * 1000;

export interface Session {
    token: string;
    user: UserDTO;
}

interface TokenClaims {
    /** expiry and issue time, in seconds */
    exp?: unknown;
    iat?: unknown;
    /** true for a login with "Angemeldet bleiben" */
    remember?: unknown;
}

function readClaims(token: string): TokenClaims {
    try {
        const payload = token.split(".")[1];
        const claims: unknown = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return claims !== null && typeof claims === "object" ? claims : {};
    } catch {
        return {};
    }
}

export function getTokenExpiry(token: string): number | null {
    const { exp } = readClaims(token);
    return typeof exp === "number" ? exp * 1000 : null;
}

/** When to tell the user that the login is about to end: 5 minutes before it does. */
export function getExpiryWarningTime(token: string): number | null {
    const expiry = getTokenExpiry(token);
    return expiry === null ? null : expiry - EXPIRY_WARNING;
}

function isExpired(token: string): boolean {
    const expiry = getTokenExpiry(token);
    return expiry !== null && expiry <= Date.now();
}

/** true for the token of a login with "Angemeldet bleiben" */
export function staysLoggedIn(token: string): boolean {
    return readClaims(token).remember === true;
}

/**
 * A login with "Angemeldet bleiben" lasts 30 days from its last renewal. Renewing it once a day
 * keeps a regular visitor logged in, without asking for a new token on every page load.
 */
export function needsRenewal(token: string): boolean {
    const { iat } = readClaims(token);
    return staysLoggedIn(token) && typeof iat === "number" && Date.now() - iat * 1000 >= ONE_DAY;
}

// A login with "Angemeldet bleiben" is kept in localStorage, so it is still there after the browser was closed.
// Any other login is kept in sessionStorage: it survives page reloads, but ends with the tab.
// Every access is wrapped in try/catch because storage can be unavailable (e.g. private mode).
function read(storage: () => Storage): Session | null {
    try {
        const raw = storage().getItem(STORAGE_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw) as Session;
        return isExpired(session.token) ? null : session;
    } catch {
        return null;
    }
}

function write(storage: () => Storage, session: Session | null) {
    try {
        if (session) {
            storage().setItem(STORAGE_KEY, JSON.stringify(session));
        } else {
            storage().removeItem(STORAGE_KEY);
        }
    } catch {
        // Storage unavailable: the session then only lives in memory
    }
}

export function loadSession(): Session | null {
    return read(() => sessionStorage) ?? read(() => localStorage);
}

export function saveSession(session: Session | null) {
    const remembered = session !== null && staysLoggedIn(session.token);
    write(() => sessionStorage, remembered ? null : session);
    write(() => localStorage, remembered ? session : null);
}
