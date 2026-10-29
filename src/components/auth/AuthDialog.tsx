import { useState } from "react";
import type { SubmitEvent } from "react";
import { AuthDialogMode, useAuth } from "./AuthContext.tsx";
import Dialog from "../ui/Dialog.tsx";
import UserController from "../../controller/UserController.ts";
import { handleApiError } from "../../controller/util/ErrorHandler.ts";
import { passwordProblem } from "../../utils/password.ts";
import FormError from "../ui/FormError";

export default function AuthDialog() {
    const { authDialog, closeAuthDialog, login, register } = useAuth();
    const [mode, setMode] = useState<AuthDialogMode>("login");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [resetSent, setResetSent] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
    const [unconfirmed, setUnconfirmed] = useState(false);
    const [confirmationResent, setConfirmationResent] = useState(false);

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
            setRegisteredEmail(null);
            setUnconfirmed(false);
            setConfirmationResent(false);
        }
    }

    function switchMode(next: AuthDialogMode) {
        setMode(next);
        setPassword("");
        setMessage(null);
        setResetSent(false);
        setRegisteredEmail(null);
        setUnconfirmed(false);
        setConfirmationResent(false);
    }

    async function resendConfirmation() {
        setBusy(true);
        setMessage(null);
        try {
            await UserController.resendConfirmation({ email, password });
            setConfirmationResent(true);
        } catch (error) {
            setMessage(handleApiError(error));
        } finally {
            setBusy(false);
        }
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        setMessage(null);
        setUnconfirmed(false);
        setConfirmationResent(false);

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
        const problem = mode === "register" ? passwordProblem(password) : null;
        if (problem) {
            setMessage(problem);
            return;
        }

        setBusy(true);
        const result =
            mode === "login"
                ? await login({ email, password, rememberMe })
                : await register({ email, password, firstname: firstname.trim(), lastname: lastname.trim() });
        setBusy(false);

        if (result.ok && mode === "register") {
            // the password stays, so the mail can be sent again from here
            setRegisteredEmail(email);
        } else if (result.ok) {
            setEmail("");
            setPassword("");
            setRememberMe(false);
            setFirstname("");
            setLastname("");
            closeAuthDialog();
        } else {
            setMessage(result.error || "Anmeldung fehlgeschlagen.");
            setUnconfirmed(result.unconfirmed === true);
        }
    }

    const isLogin = mode === "login";
    const isForgot = mode === "forgot";

    const title = registeredEmail ? "Fast geschafft" : isForgot ? "Passwort vergessen" : isLogin ? "Willkommen zurück" : "Konto erstellen";
    const intro = registeredEmail
        ? "Bestätige noch deine E-Mail-Adresse, dann kannst du dich anmelden."
        : isForgot
            ? "Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegen kannst."
            : "Melde dich an, um auf dein Konto zuzugreifen.";
    const submitLabel = isForgot ? "Link senden" : isLogin ? "Anmelden" : "Konto erstellen";

    return (
        <Dialog open={authDialog !== null} onClose={closeAuthDialog} labelledBy="auth-dialog-title" className="auth-dialog">
            <h2 id="auth-dialog-title">{title}</h2>
            <p className="muted">{intro}</p>

            {!isForgot && !registeredEmail && (
                <div className="auth-tabs" role="tablist">
                    <button type="button" role="tab" aria-selected={isLogin} onClick={() => switchMode("login")}>
                        Anmelden
                    </button>
                    <button type="button" role="tab" aria-selected={!isLogin} onClick={() => switchMode("register")}>
                        Registrieren
                    </button>
                </div>
            )}

            {registeredEmail ? (
                <div className="auth-form">
                    <p className="form-message form-message--success" role="status">
                        Wir haben dir eine Mail an {registeredEmail} geschickt. Klicke auf den Link darin, um dein Konto
                        zu bestätigen. Schau auch im Spam-Ordner nach.
                    </p>
                    <FormError message={message} />
                    {confirmationResent ? (
                        <p className="muted" role="status">Eine neue Mail ist unterwegs.</p>
                    ) : (
                        <button type="button" className="auth-text-link" onClick={resendConfirmation} disabled={busy}>
                            Keine Mail bekommen? Erneut senden
                        </button>
                    )}
                    <button type="button" className="auth-text-link" onClick={() => switchMode("login")}>
                        Zur Anmeldung
                    </button>
                </div>
            ) : isForgot && resetSent ? (
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
                                    maxLength={100}
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
                                    maxLength={100}
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
                            maxLength={254}
                            required
                        />
                    </label>
                    {!isForgot && (
                        <label className="field">
                            Passwort (mind. 8 Zeichen)
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

                    <FormError message={message} />
                    {unconfirmed && (confirmationResent ? (
                        <p className="muted" role="status">Eine neue Mail ist unterwegs.</p>
                    ) : (
                        <button type="button" className="auth-text-link" onClick={resendConfirmation} disabled={busy}>
                            Bestätigungsmail erneut senden
                        </button>
                    ))}

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
