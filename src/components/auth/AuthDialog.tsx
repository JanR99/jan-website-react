import { useState } from "react";
import type { FormEvent } from "react";
import { AuthDialogMode, useAuth } from "./AuthContext.tsx";
import Dialog from "../ui/Dialog.tsx";
import UserController from "../../controller/UserController.ts";
import { handleApiError } from "../../controller/util/ErrorHandler.ts";

export default function AuthDialog() {
    const { authDialog, closeAuthDialog, login, register } = useAuth();
    const [mode, setMode] = useState<AuthDialogMode>("login");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [resetSent, setResetSent] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");

    const [openedAs, setOpenedAs] = useState(authDialog);

    if (openedAs !== authDialog) {
        setOpenedAs(authDialog);
        if (authDialog) {
            setMode(authDialog);
            setMessage(null);
            setResetSent(false);
        }
    }

    function switchMode(next: AuthDialogMode) {
        setMode(next);
        setPassword("");
        setMessage(null);
        setResetSent(false);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setMessage(null);

        if (mode === "forgot") {
            setBusy(true);
            try {
                await UserController.requestPasswordReset({ email });
                setResetSent(true);
            } catch (error) {
                setMessage(handleApiError(error));
            } finally {
                setBusy(false);
            }
            return;
        }

        if (mode === "register" && (!firstname.trim() || !lastname.trim())) {
            setMessage("Vorname und Nachname dürfen nicht leer sein.");
            return;
        }

        setBusy(true);
        const result =
            mode === "login"
                ? await login({ email, password, rememberMe })
                : await register({ email, password, firstname: firstname.trim(), lastname: lastname.trim() });
        setBusy(false);

        if (result.ok) {
            setEmail("");
            setPassword("");
            setRememberMe(false);
            setFirstname("");
            setLastname("");
            closeAuthDialog();
        } else {
            setMessage(result.error || "Anmeldung fehlgeschlagen.");
        }
    }

    const isLogin = mode === "login";
    const isForgot = mode === "forgot";

    const title = isForgot ? "Passwort vergessen" : isLogin ? "Willkommen zurück" : "Konto erstellen";
    const intro = isForgot
        ? "Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegen kannst."
        : isLogin
            ? "Melde dich an, um auf dein Konto zuzugreifen."
            : "Mit einem Konto kannst du bald noch mehr auf der Seite machen.";
    const submitLabel = isForgot ? "Link senden" : isLogin ? "Anmelden" : "Konto erstellen";

    return (
        <Dialog open={authDialog !== null} onClose={closeAuthDialog} labelledBy="auth-dialog-title" className="auth-dialog">
            <h2 id="auth-dialog-title">{title}</h2>
            <p className="muted">{intro}</p>

            {!isForgot && (
                <div className="auth-tabs" role="tablist">
                    <button type="button" role="tab" aria-selected={isLogin} onClick={() => switchMode("login")}>
                        Anmelden
                    </button>
                    <button type="button" role="tab" aria-selected={!isLogin} onClick={() => switchMode("register")}>
                        Registrieren
                    </button>
                </div>
            )}

            {isForgot && resetSent ? (
                <div className="auth-form">
                    <p className="form-message form-message--success" role="status">
                        Falls es ein Konto mit dieser Adresse gibt, ist jetzt eine Mail mit dem Link unterwegs.
                        Schau auch im Spam-Ordner nach.
                    </p>
                    <button type="button" className="auth-text-link" onClick={() => switchMode("login")}>
                        Zurück zur Anmeldung
                    </button>
                </div>
            ) : (
                <form className="auth-form" onSubmit={handleSubmit} noValidate={false}>
                    {mode === "register" && (
                        <div className="auth-form-row">
                            <label className="field">
                                Vorname
                                <input
                                    className="input"
                                    type="text"
                                    value={firstname}
                                    onChange={(e) => setFirstname(e.target.value)}
                                    autoComplete="given-name"
                                    required
                                />
                            </label>
                            <label className="field">
                                Nachname
                                <input
                                    className="input"
                                    type="text"
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                    autoComplete="family-name"
                                    required
                                />
                            </label>
                        </div>
                    )}

                    <label className="field">
                        E-Mail
                        <input
                            className="input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </label>
                    {!isForgot && (
                        <label className="field">
                            Passwort
                            <input
                                className="input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                required
                            />
                        </label>
                    )}

                    {isLogin && (
                        <div className="auth-options">
                            <label className="auth-remember">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Angemeldet bleiben
                            </label>
                            <button type="button" className="auth-text-link" onClick={() => switchMode("forgot")}>
                                Passwort vergessen?
                            </button>
                        </div>
                    )}

                    {message && (
                        <p className="form-message form-message--error" role="alert">
                            {message}
                        </p>
                    )}

                    <button type="submit" className="btn btn-block" disabled={busy}>
                        {busy ? "Bitte warten …" : submitLabel}
                    </button>

                    {isForgot && (
                        <button type="button" className="auth-text-link" onClick={() => switchMode("login")}>
                            Zurück zur Anmeldung
                        </button>
                    )}
                </form>
            )}
        </Dialog>
    );
}
