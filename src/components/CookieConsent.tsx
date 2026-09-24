import React, { useEffect, useState } from 'react';
import '../styles/CookieConsent.css';

const CONSENT_KEY = 'cookieConsent';

const CookieConsent: React.FC = () => {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        try {
            const consent = localStorage.getItem(CONSENT_KEY);

            if (!consent) {
                setShowConsent(true);
            }
        } catch {
            setShowConsent(true);
        }
    }, []);

    const acceptCookies = () => {
        try {
            localStorage.setItem(CONSENT_KEY, 'accepted');
        } finally {
            setShowConsent(false);
        }
    };

    const rejectCookies = () => {
        try {
            localStorage.setItem(CONSENT_KEY, 'rejected');
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
            <div className="cookie-consent-content">
                <h2 id="cookie-consent-title">Cookie-Einstellungen</h2>
                <p>
                    Wir verwenden Cookies, um unsere Website zu verbessern
                    und bestimmte Funktionen bereitzustellen. Du kannst
                    selbst entscheiden, welchen Cookies du zustimmst.
                </p>
                <div className="cookie-consent-actions">
                    <button
                        type="button"
                        className="cookie-consent-button cookie-consent-button--secondary"
                        onClick={rejectCookies}
                    >
                        Nur notwendige
                    </button>
                    <button
                        type="button"
                        className="cookie-consent-button"
                        onClick={acceptCookies}
                    >
                        Alle akzeptieren
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
