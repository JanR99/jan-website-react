import { describe, expect, it } from 'vitest';
import { handleApiError } from './ErrorHandler';

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
