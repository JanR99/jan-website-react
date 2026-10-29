import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../layout/PageHeader";
import UserController from "../../controller/UserController.ts";
import { handleApiError } from "../../controller/util/ErrorHandler.ts";
import { useAuth } from "./AuthContext.tsx";
import FormError from "../ui/FormError";
import Spinner from "../ui/Spinner";

const confirmations = new Map<string, Promise<void>>();

function confirmOnce(token: string): Promise<void> {
    let confirmation = confirmations.get(token);
    if (!confirmation) {
        confirmation = UserController.confirmEmail({ token });
        confirmations.set(token, confirmation);
    }
    return confirmation;
}

export default function EmailConfirmPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const { openAuthDialog } = useAuth();
    const [result, setResult] = useState<{ token: string; failed: boolean } | null>(null);

    useEffect(() => {
        if (!token) return;
        let active = true;
        confirmOnce(token).then(
            () => active && setResult({ token, failed: false }),
            () => active && setResult({ token, failed: true }),
        );
        return () => {
            active = false;
        };
    }, [token]);

    const done = result?.token === token ? result : null;

    return (
        <div className="container password-reset">
            <PageHeader title="E-Mail-Adresse bestätigen" back={{ to: "/", label: "Zur Startseite" }} />

            <div className="card card-pad password-reset-card">
                {!token ? (
                    <FormError message="Dieser Link ist unvollständig. Öffne bitte den Link aus der Mail noch einmal." />
                ) : !done ? (
                    <Spinner />
                ) : done.failed ? (
                    <ResendForm />
                ) : (
                    <div className="auth-form">
                        <p className="form-message form-message--success" role="status">
                            Deine E-Mail-Adresse ist bestätigt. Du kannst dich jetzt anmelden.
                        </p>
                        <button type="button" className="btn btn-block" onClick={() => openAuthDialog("login")}>
                            Jetzt anmelden
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ResendForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        setBusy(true);
        setMessage(null);
        try {
            await UserController.resendConfirmation({ email, password });
            setSent(true);
        } catch (error) {
            setMessage(handleApiError(error));
        } finally {
            setBusy(false);
        }
    }

    if (sent) {
        return (
            <p className="form-message form-message--success" role="status">
                Falls dein Konto noch nicht bestätigt ist, ist jetzt eine neue Mail unterwegs. Schau auch im Spam-Ordner nach.
            </p>
        );
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <FormError message="Dieser Link ist ungültig oder abgelaufen. Gib deine E-Mail-Adresse und dein Passwort ein, dann schicken wir dir eine neue Mail." />
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
            <label className="field">
                Passwort
                <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                />
            </label>
            <FormError message={message} />
            <p className="muted">
                Konten, die 7 Tage lang nicht bestätigt werden, werden gelöscht. Dann musst du dich neu registrieren.
            </p>
            <button type="submit" className="btn btn-block" disabled={busy}>
                {busy ? "Bitte warten …" : "Neue Mail senden"}
            </button>
        </form>
    );
}
