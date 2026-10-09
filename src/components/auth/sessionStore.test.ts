import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getExpiryWarningTime, getTokenExpiry, loadSession, needsRenewal, saveSession, staysLoggedIn,
} from './sessionStore';

const STORAGE_KEY = 'jan-website-session';
const HOUR = 60 * 60;
const DAY = 24 * HOUR;

const user = { id: 1, email: 'anna@example.com', firstname: 'Anna', lastname: 'Test' };

const nowInSeconds = () => Math.floor(Date.now() / 1000);

/** A token like the backend issues it, only without a real signature. Times are seconds relative to now. */
function token(claims: { issuedAgo?: number; expiresIn?: number; remember?: boolean }): string {
    const payload = {
        sub: user.email,
        remember: claims.remember,
        iat: nowInSeconds() - (claims.issuedAgo ?? 0),
        exp: nowInSeconds() + (claims.expiresIn ?? 2 * HOUR),
    };
    const base64Url = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `header.${base64Url}.signature`;
}

const shortLogin = () => ({ token: token({ remember: false }), user });
const longLogin = () => ({ token: token({ remember: true, expiresIn: 30 * DAY }), user });

beforeEach(() => {
    // a fixed clock, so "now" is the same for a token and for the code that checks it
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-07T12:00:00Z'));
    sessionStorage.clear();
    localStorage.clear();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('saveSession', () => {
    it('keeps a login without "Angemeldet bleiben" only for this tab', () => {
        saveSession(shortLogin());

        expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('keeps a login with "Angemeldet bleiben" beyond the tab', () => {
        saveSession(longLogin());

        expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
        expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('removes the login everywhere on logout', () => {
        saveSession(longLogin());
        saveSession(null);
        expect(loadSession()).toBeNull();

        saveSession(shortLogin());
        saveSession(null);
        expect(loadSession()).toBeNull();
    });

    it('leaves no long login behind when a short one follows, and the other way round', () => {
        saveSession(longLogin());
        saveSession(shortLogin());
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

        saveSession(longLogin());
        expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });
});

describe('loadSession', () => {
    it('returns the saved login', () => {
        const short = shortLogin();
        saveSession(short);
        expect(loadSession()).toEqual(short);

        const long = longLogin();
        saveSession(long);
        expect(loadSession()).toEqual(long);
    });

    it('returns null when nobody is logged in', () => {
        expect(loadSession()).toBeNull();
    });

    it('drops a login whose token has expired', () => {
        saveSession({ token: token({ remember: true, issuedAgo: 31 * DAY, expiresIn: -DAY }), user });
        expect(loadSession()).toBeNull();

        saveSession({ token: token({ issuedAgo: 3 * HOUR, expiresIn: -HOUR }), user });
        expect(loadSession()).toBeNull();
    });

    it('returns null when the stored value is not readable', () => {
        localStorage.setItem(STORAGE_KEY, 'not json');
        expect(loadSession()).toBeNull();
    });
});

describe('staysLoggedIn', () => {
    it('is true only for a token issued with "Angemeldet bleiben"', () => {
        expect(staysLoggedIn(token({ remember: true }))).toBe(true);
        expect(staysLoggedIn(token({ remember: false }))).toBe(false);
        // tokens from before the feature have no such entry
        expect(staysLoggedIn(token({}))).toBe(false);
        expect(staysLoggedIn('not-a-token')).toBe(false);
    });
});

describe('needsRenewal', () => {
    it('is true for a long login that is at least a day old', () => {
        expect(needsRenewal(token({ remember: true, issuedAgo: DAY, expiresIn: 29 * DAY }))).toBe(true);
        expect(needsRenewal(token({ remember: true, issuedAgo: 20 * DAY, expiresIn: 10 * DAY }))).toBe(true);
    });

    it('is false for a long login from today', () => {
        expect(needsRenewal(token({ remember: true, expiresIn: 30 * DAY }))).toBe(false);
        expect(needsRenewal(token({ remember: true, issuedAgo: 23 * HOUR, expiresIn: 29 * DAY }))).toBe(false);
    });

    it('is false for a login without "Angemeldet bleiben", however old', () => {
        expect(needsRenewal(token({ remember: false, issuedAgo: HOUR }))).toBe(false);
        expect(needsRenewal(token({ issuedAgo: 2 * DAY }))).toBe(false);
        expect(needsRenewal('not-a-token')).toBe(false);
    });
});

describe('getTokenExpiry', () => {
    it('returns the expiry in milliseconds', () => {
        const expiry = getTokenExpiry(token({ expiresIn: 2 * HOUR }));
        expect(expiry).toBe((nowInSeconds() + 2 * HOUR) * 1000);
    });

    it('returns null for something that is not a token', () => {
        expect(getTokenExpiry('not-a-token')).toBeNull();
        expect(getTokenExpiry('')).toBeNull();
    });
});

describe('getExpiryWarningTime', () => {
    it('is 5 minutes before the login ends', () => {
        const warning = getExpiryWarningTime(token({ expiresIn: 2 * HOUR }));

        expect(warning).toBe(Date.now() + (2 * HOUR - 5 * 60) * 1000);
    });

    it('is already over for a login that ends within the next 5 minutes', () => {
        const warning = getExpiryWarningTime(token({ expiresIn: 3 * 60 }));

        expect(warning).toBeLessThan(Date.now());
    });

    it('is null for a token that names no end', () => {
        expect(getExpiryWarningTime('not-a-token')).toBeNull();
    });
});
