import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import Dialog from "../ui/Dialog";
import { BookOpen, Heart, KeyRound, Pencil, Trash2 } from "lucide-react";

const PASSWORD_MIN_LENGTH = 8;

export default function ProfileSection() {
    const { user } = useAuth();
    const { favorites } = useFavorites();
    if (!user) return null;

    return (
        <div className="account-stack">
            <PersonalDataCard />

            <div className="account-tiles">
                <Link to="/konto/favoriten" className="account-tile card">
                    <span className="account-tile-icon"><Heart size={20} /></span>
                    <strong>{favorites.length}</strong>
                    <span className="muted">Lieblingsrezepte</span>
                </Link>
                <Link to="/cookbook" className="account-tile card">
                    <span className="account-tile-icon"><BookOpen size={20} /></span>
                    <strong>Kochbuch</strong>
                    <span className="muted">Neue Rezepte entdecken</span>
                </Link>
            </div>

            <PasswordCard />

            <DangerZoneCard />
        </div>
    );
}

function PersonalDataCard() {
    const { user, updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    if (!user) return null;

    function startEditing() {
        setFirstname(user!.firstname ?? "");
        setLastname(user!.lastname ?? "");
        setError(null);
        setSaved(false);
        setEditing(true);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const first = firstname.trim();
        const last = lastname.trim();
        if (!first || !last) {
            setError("Vorname und Nachname dürfen nicht leer sein.");
            return;
        }

        setBusy(true);
        setError(null);
        const result = await updateProfile({ firstname: first, lastname: last });
        setBusy(false);

        if (result.ok) {
            setEditing(false);
            setSaved(true);
        } else {
            setError(result.error);
        }
    }

    const rows: [string, string][] = [
        ["Vorname", user.firstname],
        ["Nachname", user.lastname],
        ["E-Mail", user.email],
    ];

    return (
        <div className="card card-pad">
            <div className="account-card-head">
                <h2 className="account-card-title">Persönliche Daten</h2>
                {!editing && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={startEditing}>
                        <Pencil size={16} />
                        Bearbeiten
                    </button>
                )}
            </div>

            {editing ? (
                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="profile-form-row">
                        <label className="field">
                            Vorname
                            <input
                                className="input"
                                type="text"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                autoComplete="given-name"
                                maxLength={100}
                                autoFocus
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
                    <p className="muted profile-form-hint">Die E-Mail-Adresse kann nicht geändert werden.</p>

                    {error && (
                        <p className="form-message form-message--error" role="alert">{error}</p>
                    )}

                    <div className="profile-form-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)} disabled={busy}>
                            Abbrechen
                        </button>
                        <button type="submit" className="btn" disabled={busy}>
                            {busy ? "Speichern …" : "Speichern"}
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <dl className="profile-list">
                        {rows.map(([label, value]) => (
                            <div key={label}>
                                <dt>{label}</dt>
                                <dd>{value || "–"}</dd>
                            </div>
                        ))}
                    </dl>
                    {saved && (
                        <p className="form-message form-message--success profile-saved" role="status">
                            Dein Name wurde gespeichert.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}

function PasswordCard() {
    const { user, changePassword } = useAuth();
    const [editing, setEditing] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    if (!user) return null;

    function startEditing() {
        setCurrentPassword("");
        setNewPassword("");
        setConfirm("");
        setError(null);
        setSaved(false);
        setEditing(true);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (newPassword.length < PASSWORD_MIN_LENGTH) {
            setError(`Das neue Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein.`);
            return;
        }
        if (newPassword !== confirm) {
            setError("Die neuen Passwörter stimmen nicht überein.");
            return;
        }

        setBusy(true);
        setError(null);
        const result = await changePassword({ currentPassword, newPassword });
        setBusy(false);

        if (result.ok) {
            setEditing(false);
            setSaved(true);
        } else {
            setError(result.error);
        }
    }

    return (
        <div className="card card-pad">
            <div className="account-card-head">
                <h2 className="account-card-title">Passwort</h2>
                {!editing && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={startEditing}>
                        <KeyRound size={16} />
                        Ändern
                    </button>
                )}
            </div>

            {editing ? (
                <form className="profile-form" onSubmit={handleSubmit}>
                    {/* not visible: tells a password manager which account the new password belongs to */}
                    <input type="text" autoComplete="username" value={user.email} readOnly hidden />
                    <label className="field">
                        Aktuelles Passwort
                        <input
                            className="input"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            autoComplete="current-password"
                            autoFocus
                            required
                        />
                    </label>
                    <div className="profile-form-row">
                        <label className="field">
                            Neues Passwort
                            <input
                                className="input"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoComplete="new-password"
                                minLength={PASSWORD_MIN_LENGTH}
                                required
                            />
                        </label>
                        <label className="field">
                            Neues Passwort wiederholen
                            <input
                                className="input"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </label>
                    </div>
                    <p className="muted profile-form-hint">
                        Mindestens {PASSWORD_MIN_LENGTH} Zeichen. Auf allen anderen Geräten wirst du danach abgemeldet.
                    </p>

                    {error && (
                        <p className="form-message form-message--error" role="alert">{error}</p>
                    )}

                    <div className="profile-form-actions">
                        <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)} disabled={busy}>
                            Abbrechen
                        </button>
                        <button type="submit" className="btn" disabled={busy}>
                            {busy ? "Speichern …" : "Passwort ändern"}
                        </button>
                    </div>
                </form>
            ) : saved ? (
                <p className="form-message form-message--success" role="status">
                    Dein Passwort wurde geändert. Auf allen anderen Geräten bist du jetzt abgemeldet.
                </p>
            ) : (
                <p className="muted">
                    Wenn du dein Passwort änderst, wirst du auf allen anderen Geräten abgemeldet.
                </p>
            )}
        </div>
    );
}

function DangerZoneCard() {
    const { deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function openDialog() {
        setPassword("");
        setError(null);
        setOpen(true);
    }

    function closeDialog() {
        if (!busy) setOpen(false);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setBusy(true);
        setError(null);
        const result = await deleteAccount(password);
        setBusy(false);

        if (result.ok) {
            setOpen(false);
            navigate("/", { replace: true });
        } else {
            setError(result.error);
        }
    }

    return (
        <div className="card card-pad account-danger">
            <h2 className="account-card-title">Konto löschen</h2>
            <p className="muted">
                Dein Konto und deine gespeicherten Lieblingsrezepte werden dauerhaft gelöscht.
                Das lässt sich nicht rückgängig machen.
            </p>
            <button type="button" className="btn btn-danger" onClick={openDialog}>
                <Trash2 size={16} />
                Konto löschen
            </button>

            <Dialog open={open} onClose={closeDialog} labelledBy="delete-account-title" className="confirm-dialog">
                <h2 id="delete-account-title">Konto wirklich löschen?</h2>
                <p className="muted">
                    Gib zur Bestätigung dein Passwort ein. Danach wirst du abgemeldet.
                </p>
                <form className="profile-form" onSubmit={handleSubmit}>
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

                    {error && (
                        <p className="form-message form-message--error" role="alert">{error}</p>
                    )}

                    <div className="profile-form-actions">
                        <button type="button" className="btn btn-ghost" onClick={closeDialog} disabled={busy}>
                            Abbrechen
                        </button>
                        <button type="submit" className="btn btn-danger" disabled={busy || !password}>
                            {busy ? "Wird gelöscht …" : "Endgültig löschen"}
                        </button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
