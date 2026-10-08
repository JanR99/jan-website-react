import React, { useEffect, useState } from 'react';
import '../styles/CookieConsent.css';

const CONSENT_KEY = 'cookieConsent';
const OPEN_EVENT = 'cookie-consent:open';

export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_EVENT));

const CookieConsent: React.FC = () => {
    const [showConsent, setShowConsent] = useState(() => {
        try {
            return !localStorage.getItem(CONSENT_KEY);
        } catch {
            return true;
        }
    });

    useEffect(() => {
        const open = () => setShowConsent(true);
        window.addEventListener(OPEN_EVENT, open);
        return () => window.removeEventListener(OPEN_EVENT, open);
    }, []);

    const saveChoice = (choice: 'accepted' | 'rejected') => {
        try {
            localStorage.setItem(CONSENT_KEY, choice);
        } catch {
            // Storage nicht verfügbar
        } finally {
            setShowConsent(false);
        }
    };

    if (!showConsent) {
        return null;
    }

    return (
        <div
            className="cookie-consent"
            role="dialog"
            aria-modal="false"
            aria-labelledby="cookie-consent-title"
        >
            <h2 id="cookie-consent-title">🍪 Cookie-Einstellungen</h2>
            <p>
                Wir verwenden Cookies, um unsere Website zu verbessern
                und bestimmte Funktionen bereitzustellen. Du kannst
                selbst entscheiden, welchen Cookies du zustimmst.
            </p>
            <div className="cookie-consent-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => saveChoice('rejected')}>
                    Nur notwendige
                </button>
                <button type="button" className="btn btn-sm" onClick={() => saveChoice('accepted')}>
                    Alle akzeptieren
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;
