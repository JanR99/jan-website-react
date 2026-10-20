import PageHeader from "./layout/PageHeader";

export default function PrivacyPage() {
    return (
        <div className="container privacy">
            <PageHeader title="Datenschutz" back={{ to: "/", label: "Zur Startseite" }} />

            <div className="card card-pad privacy-text">
                <h2>Keine Cookies, kein Tracking</h2>
                <p>
                    Diese Website setzt keine Cookies und verwendet keine Analyse-, Tracking- oder Werbedienste.
                    Im Speicher deines Browsers (Local Storage / Session Storage) wird nur abgelegt, was für
                    Funktionen nötig ist, die du selbst nutzt:
                </p>
                <ul>
                    <li>deine Anmeldung, solange du angemeldet bist (mit „Angemeldet bleiben“ bis zu 30 Tage, sonst bis der Tab geschlossen wird),</li>
                    <li>ob du die helle oder dunkle Darstellung gewählt hast,</li>
                    <li>eine Kopie der Seite, der Rezepte und bereits angesehener Bilder, damit die Seite auch offline funktioniert.</li>
                </ul>
                <p>Du kannst diese Daten jederzeit über die Einstellungen deines Browsers löschen.</p>

                <h2>Benutzerkonto</h2>
                <p>
                    Wenn du ein Konto anlegst, speichere ich deine E-Mail-Adresse, deinen Namen und dein Passwort –
                    das Passwort nur verschlüsselt, niemand kann es im Klartext lesen. Dazu kommen deine
                    Favoriten und Feedback, das du über die Seite schickst. Die Daten nutze ich nur, um dir die
                    Funktionen der Website bereitzustellen, und gebe sie nicht weiter.
                </p>
                <p>Du kannst dein Konto jederzeit unter „Konto“ löschen; dabei werden deine Kontodaten und Favoriten entfernt.</p>

                <h2>Karte</h2>
                <p>
                    Die Karte im Reisetagebuch lädt ihre Kartenbilder direkt von OpenStreetMap.
                    Dabei wird deine IP-Adresse an deren Server übertragen, sonst nichts.
                </p>

                <h2>Bring!</h2>
                <p>
                    Der Knopf „Auf die Bring!-Liste“ bei einem Rezept öffnet Bring! und übergibt dabei den Link zum
                    Rezept und die gewählten Portionen. Bring! lädt darüber Titel, Bild und Zutaten des Rezepts.
                    Was Bring! danach mit deinen Daten macht, steht in dessen Datenschutzerklärung.
                </p>
            </div>
        </div>
    );
}
