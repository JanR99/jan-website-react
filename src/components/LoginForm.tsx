import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "./auth/AuthContext";

export default function LoginForm() {
    const { user, login, logout } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    if (user) {
        return (
            <div>
                <p>Angemeldet als {user.email}</p>
                <button type="button" onClick={logout}>Abmelden</button>
            </div>
        );
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setBusy(true);
        setMessage(null);

        const result = await login({ email, password });

        if (!result.ok) {
            setMessage(
                result.error === "invalid-credentials"
                    ? "E-Mail oder Passwort ist falsch."
                    : "Die Anmeldung ist gerade nicht verfügbar. Bitte versuche es später erneut."
            );
        }
        setPassword("");
        setBusy(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                E-Mail
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                />
            </label>
            <label>
                Passwort
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                />
            </label>
            <button type="submit" disabled={busy}>
                {busy ? "Anmelden ..." : "Anmelden"}
            </button>
            {message && <p role="alert">{message}</p>}
        </form>
    );
}