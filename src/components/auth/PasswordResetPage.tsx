import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../layout/PageHeader";
import UserController from "../../controller/UserController.ts";
import { handleApiError } from "../../controller/util/ErrorHandler.ts";
import { useAuth } from "./AuthContext.tsx";

const PASSWORD_MIN_LENGTH = 8;

export default function PasswordResetPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const { openAuthDialog } = useAuth();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setMessage(null);

        if (password.length < PASSWORD_MIN_LENGTH) {
            setMessage(`Das Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein.`);
            return;
        }
        if (password !== confirm) {
            setMessage("Die Passwörter stimmen nicht überein.");
            return;
        }

        setBusy(true);
        try {
            await UserController.resetPassword({ token, password });
            setDone(true);
        } catch (error) {
            setMessage(handleApiError(error));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="container password-reset">
            <PageHeader title="Neues Passwort" back={{ to: "/", label: "Zur Startseite" }} />

            <div className="card card-pad password-reset-card">
                {!token ? (
                    <p className="form-message form-message--error" role="alert">
                        Dieser Link ist unvollständig. Fordere bitte über „Passwort vergessen?“ einen neuen an.
                    </p>
                ) : done ? (
                    <div className="auth-form">
                        <p className="form-message form-message--success" role="status">
                            Dein Passwort wurde geändert. Du kannst dich jetzt damit anmelden.
                        </p>
                        <button type="button" className="btn btn-block" onClick={() => openAuthDialog("login")}>
                            Jetzt anmelden
                        </button>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label className="field">
                            Neues Passwort
                            <input
                                className="input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                minLength={PASSWORD_MIN_LENGTH}
                                required
                            />
                        </label>
                        <label className="field">
                            Passwort wiederholen
                            <input
                                className="input"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </label>

                        {message && (
                            <p className="form-message form-message--error" role="alert">
                                {message}
                            </p>
                        )}

                        <button type="submit" className="btn btn-block" disabled={busy}>
                            {busy ? "Bitte warten …" : "Passwort speichern"}
                        </button>

                        {message && (
                            <button type="button" className="auth-text-link" onClick={() => openAuthDialog("forgot")}>
                                Neuen Link anfordern
                            </button>
                        )}
                    </form>
                )}
            </div>

            <p className="muted password-reset-hint">
                Doch wieder eingefallen? <Link to="/" onClick={() => openAuthDialog("login")}>Anmelden</Link>
            </p>
        </div>
    );
}
