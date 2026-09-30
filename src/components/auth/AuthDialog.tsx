import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AuthDialogMode, useAuth } from "./AuthContext.tsx";
import Dialog from "../ui/Dialog.tsx";

export default function AuthDialog() {
    const { authDialog, closeAuthDialog, login, register } = useAuth();
    const [mode, setMode] = useState<AuthDialogMode>("login");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");

    useEffect(() => {
        if (authDialog) {
            setMode(authDialog);
            setMessage(null);
        }
    }, [authDialog]);

    function switchMode(next: AuthDialogMode) {
        setMode(next);
        setPassword("");
        setMessage(null);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setMessage(null);

        if (mode === "register" && (!firstname.trim() || !lastname.trim())) {
            setMessage("Vorname und Nachname dürfen nicht leer sein.");
            return;
        }

        setBusy(true);
        const result =
            mode === "login"
                ? await login({ email, password })
                : await register({ email, password, firstname: firstname.trim(), lastname: lastname.trim() });
        setBusy(false);

        if (result.ok) {
            setEmail("");
            setPassword("");
            setFirstname("");
            setLastname("");
            closeAuthDialog();
        } else {
            setMessage(result.error || "Anmeldung fehlgeschlagen.");
        }
    }

    const isLogin = mode === "login";

    return (
        <Dialog open={authDialog !== null} onClose={closeAuthDialog} labelledBy="auth-dialog-title" className="auth-dialog">
            <h2 id="auth-dialog-title">{isLogin ? "Willkommen zurück" : "Konto erstellen"}</h2>
            <p className="muted">
                {isLogin
                    ? "Melde dich an, um auf dein Konto zuzugreifen."
                    : "Mit einem Konto kannst du bald noch mehr auf der Seite machen."}
            </p>

            <div className="auth-tabs" role="tablist">
                <button type="button" role="tab" aria-selected={isLogin} onClick={() => switchMode("login")}>
                    Anmelden
                </button>
                <button type="button" role="tab" aria-selected={!isLogin} onClick={() => switchMode("register")}>
                    Registrieren
                </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate={false}>
                {!isLogin && (
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

                {message && (
                    <p className="form-message form-message--error" role="alert">
                        {message}
                    </p>
                )}

                <button type="submit" className="btn btn-block" disabled={busy}>
                    {busy ? "Bitte warten …" : isLogin ? "Anmelden" : "Konto erstellen"}
                </button>
            </form>
        </Dialog>
    );
}
