import { describe, expect, it } from 'vitest';
import { handleApiError, isForbidden, isUnauthenticated } from './ErrorHandler';

const FALLBACK = 'Gerade nicht verfügbar. Bitte später erneut versuchen.';

describe('handleApiError', () => {
    it('returns the response body when it is a text', () => {
        expect(handleApiError({ response: { body: 'E-Mail ist bereits vergeben' } })).toBe('E-Mail ist bereits vergeben');
    });

    it('returns the message of a JSON response body', () => {
        expect(handleApiError({ response: { body: { message: 'Rezept nicht gefunden' } } })).toBe('Rezept nicht gefunden');
    });

    it('reads response.data when there is no response.body', () => {
        expect(handleApiError({ response: { data: 'Zu viele Anmeldeversuche' } })).toBe('Zu viele Anmeldeversuche');
        expect(handleApiError({ response: { data: { message: 'Nicht angemeldet' } } })).toBe('Nicht angemeldet');
    });

    it('prefers response.body over response.data', () => {
        expect(handleApiError({ response: { body: 'aus body', data: 'aus data' } })).toBe('aus body');
    });

    it('parses the message out of a JSON response text when the body has none', () => {
        expect(handleApiError({ response: { text: '{"message":"Passwort ist falsch"}' } })).toBe('Passwort ist falsch');
        expect(handleApiError({ response: { body: {}, text: '{"message":"Passwort ist falsch"}' } })).toBe('Passwort ist falsch');
    });

    it('returns the response text as it is when it is not JSON', () => {
        expect(handleApiError({ response: { text: 'Service Unavailable' } })).toBe('Service Unavailable');
    });

    it('skips an empty body or message and uses the response text instead', () => {
        expect(handleApiError({ response: { body: '   ', text: 'Bad Gateway' } })).toBe('Bad Gateway');
        expect(handleApiError({ response: { body: { message: '' }, text: 'Bad Gateway' } })).toBe('Bad Gateway');
        expect(handleApiError({ response: { body: { message: 42 }, text: 'Bad Gateway' } })).toBe('Bad Gateway');
    });

    it('returns the fallback text instead of the JSON Spring answers with on its own', () => {
        const springError = {
            timestamp: '2026-10-12T08:00:00.000+00:00',
            status: 500,
            error: 'Internal Server Error',
            path: '/api/users/register',
        };

        expect(handleApiError({ response: { status: 500, body: springError, text: JSON.stringify(springError) } })).toBe(FALLBACK);
        expect(handleApiError({ response: { status: 400, text: JSON.stringify({ ...springError, status: 400, error: 'Bad Request' }) } }))
            .toBe(FALLBACK);
    });

    it('returns the fallback text instead of an HTML error page', () => {
        const page = '<!DOCTYPE html>\n<html lang=en><title>Error 502 (Server Error)!!1</title><p>That’s an error.</p></html>';

        expect(handleApiError({ response: { status: 502, text: page } })).toBe(FALLBACK);
        expect(handleApiError({ response: { status: 502, text: '  <html><body>Bad Gateway</body></html>' } })).toBe(FALLBACK);
    });

    it('returns the fallback text for a JSON message that is empty', () => {
        expect(handleApiError({ response: { text: '{"message":"  "}' } })).toBe(FALLBACK);
    });

    it('returns the fallback text when the response says nothing', () => {
        expect(handleApiError({ response: {} })).toBe(FALLBACK);
        expect(handleApiError({ response: { body: '', text: '  ' } })).toBe(FALLBACK);
        expect(handleApiError({ response: { body: { code: 500 } } })).toBe(FALLBACK);
    });

    it('returns the fallback text for errors without a response', () => {
        expect(handleApiError({})).toBe(FALLBACK);
        expect(handleApiError(new Error('Failed to fetch'))).toBe(FALLBACK);
        expect(handleApiError('boom')).toBe(FALLBACK);
    });
});

describe('isUnauthenticated', () => {
    it('is true for a 401 answer', () => {
        expect(isUnauthenticated({ response: { status: 401 } })).toBe(true);
        expect(isUnauthenticated({ status: 401 })).toBe(true);
    });

    it('is false for other answers', () => {
        expect(isUnauthenticated({ response: { status: 400 } })).toBe(false);
        expect(isUnauthenticated({ response: { status: 403 } })).toBe(false);
        expect(isUnauthenticated({ response: { status: 500 } })).toBe(false);
    });

    it('is false for errors without an answer, e.g. when offline', () => {
        expect(isUnauthenticated(new Error('Failed to fetch'))).toBe(false);
        expect(isUnauthenticated({})).toBe(false);
        expect(isUnauthenticated(undefined)).toBe(false);
        expect(isUnauthenticated('boom')).toBe(false);
    });
});

describe('isForbidden', () => {
    it('is true for a 403 answer', () => {
        expect(isForbidden({ response: { status: 403 } })).toBe(true);
        expect(isForbidden({ status: 403 })).toBe(true);
    });

    it('is false for other answers and for no answer at all', () => {
        expect(isForbidden({ response: { status: 400 } })).toBe(false);
        expect(isForbidden({ response: { status: 401 } })).toBe(false);
        expect(isForbidden(null)).toBe(false);
    });
});
