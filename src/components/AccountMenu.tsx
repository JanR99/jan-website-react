import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "./auth/AuthContext.tsx";
import { handleApiError } from "../controller/util/ErrorHandler.ts";
import "../styles/AccountMenu.css";

type Tab = "login" | "register";

export default function AccountMenu() {
    const { user, login, register, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<Tab>("login");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");

    const rootRef = useRef<HTMLDivElement>(null);

    // Close the dropdown on an outside click
    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function resetFields() {
        setPassword("");
        setMessage(null);
    }

    function switchTab(next: Tab) {
        setTab(next);
        resetFields();
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setBusy(true);
        setMessage(null);

        if (tab === "register" && (!firstname.trim() || !lastname.trim())) {
            setMessage("Vorname und Nachname dürfen nicht leer sein.");
            setBusy(false);
            return;
        }

        let result: { ok: boolean; error?: string };

        try {
            result =
                tab === "login"
                    ? await login({ email, password })
                    : await register({ email, password, firstname, lastname });
        } catch (error: any) {
            result = { ok: false, error: handleApiError(error) };
        }

        if (result.ok) {
            setOpen(false);
            setEmail("");
            setPassword("");
            setFirstname("");
            setLastname("");
        } else {
            setMessage(result.error || "Register/Login error happened");
        }
        setBusy(false);
    }

    return (
        <div className="account-menu" ref={rootRef}>
            {user ? (
                <>
                    <button className="account-menu-trigger" onClick={() => setOpen((v) => !v)}>
                        {user.email}
                    </button>
                    {open && (
                        <div className="account-menu-dropdown">
                            <p className="account-menu-greeting">Angemeldet als<br />{user.email}</p>
                            <button
                                type="button"
                                onClick={() => {
                                    logout();
                                    setOpen(false);
                                }}
                            >
                                Abmelden
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <button className="account-menu-trigger" onClick={() => setOpen((v) => !v)}>
                        Konto
                    </button>
                    {open && (
                        <div className="account-menu-dropdown">
                            <div className="account-menu-tabs">
                                <span
                                    className={tab === "login" ? "active" : ""}
                                    onClick={() => switchTab("login")}
                                >
                                    Anmelden
                                </span>
                                <span
                                    className={tab === "register" ? "active" : ""}
                                    onClick={() => switchTab("register")}
                                >
                                    Registrieren
                                </span>
                            </div>

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
                                        autoComplete={tab === "login" ? "current-password" : "new-password"}
                                        required
                                    />
                                </label>

                                {tab === "register" && (
                                    <>
                                        <label>
                                            Vorname
                                            <input
                                                type="text"
                                                value={firstname}
                                                onChange={(e) => setFirstname(e.target.value)}
                                                autoComplete="given-name"
                                                required
                                            />
                                        </label>
                                        <label>
                                            Nachname
                                            <input
                                                type="text"
                                                value={lastname}
                                                onChange={(e) => setLastname(e.target.value)}
                                                autoComplete="family-name"
                                                required
                                            />
                                        </label>
                                    </>
                                )}

                                <button type="submit" disabled={busy}>
                                    {busy
                                        ? "Bitte warten ..."
                                        : tab === "login"
                                            ? "Anmelden"
                                            : "Registrieren"}
                                </button>

                                {message && <p className="account-menu-message" role="alert">{message}</p>}
                            </form>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}