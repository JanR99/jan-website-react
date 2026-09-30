import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import UserController from "../../controller/UserController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { UserDTO } from "../../types/entities";
import Avatar from "../ui/Avatar";
import { Lock, Mail, ShieldMinus, ShieldPlus } from "lucide-react";

export default function AdminUsersSection() {
    const { user, permissions } = useAuth();
    const [admins, setAdmins] = useState<UserDTO[] | null>(null);
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const canManage = permissions?.canManageUsers === true;

    const loadAdmins = useCallback(async () => {
        try {
            setAdmins(await UserController.getAdmins());
        } catch (err) {
            setError(handleApiError(err));
            setAdmins([]);
        }
    }, []);

    useEffect(() => {
        if (canManage) void loadAdmins();
    }, [canManage, loadAdmins]);

    async function changeStatus(targetEmail: string, admin: boolean) {
        setBusy(true);
        setError(null);
        setNotice(null);
        try {
            const changed = await UserController.setAdminStatus({ targetEmail, admin });
            await loadAdmins();
            setNotice(admin ? `${changed.email} ist jetzt Admin.` : `${changed.email} ist kein Admin mehr.`);
            return true;
        } catch (err) {
            setError(handleApiError(err));
            return false;
        } finally {
            setBusy(false);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const target = email.trim();
        if (!target) return;
        if (await changeStatus(target, true)) setEmail("");
    }

    if (permissions === null) {
        return <div className="loading"><div className="spinner" /></div>;
    }

    if (!canManage) {
        return (
            <div className="card empty-state">
                <span className="empty-state-icon"><Lock size={26} /></span>
                <h3>Keine Berechtigung</h3>
                <p>Nur Admins können Admin-Rechte vergeben.</p>
            </div>
        );
    }

    return (
        <div className="account-stack">
            <form className="card card-pad profile-form" onSubmit={handleSubmit}>
                <h2 className="account-card-title">Admin hinzufügen</h2>
                <div className="admin-add-row">
                    <label className="input-with-icon admin-add-email">
                        <Mail size={18} />
                        <input
                            className="input"
                            type="email"
                            placeholder="E-Mail-Adresse des Nutzers"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-label="E-Mail-Adresse des Nutzers"
                            required
                        />
                    </label>
                    <button type="submit" className="btn" disabled={busy || !email.trim()}>
                        <ShieldPlus size={18} />
                        Zum Admin machen
                    </button>
                </div>
                <p className="muted recipe-editor-hint">Der Nutzer muss bereits ein Konto haben.</p>
            </form>

            {notice && <p className="form-message form-message--success" role="status">{notice}</p>}
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}

            <div className="card recipe-admin-list">
                {admins === null ? (
                    <div className="loading"><div className="spinner" /></div>
                ) : admins.length === 0 ? (
                    <p className="muted recipe-admin-empty">Keine Admins gefunden.</p>
                ) : (
                    <ul>
                        {admins.map((admin) => {
                            const isSelf = admin.email === user?.email;
                            return (
                                <li key={admin.id} className="recipe-admin-row">
                                    <Avatar user={admin} size={40} />
                                    <div className="recipe-admin-row-text">
                                        <strong>
                                            {[admin.firstname, admin.lastname].filter(Boolean).join(" ") || admin.email}
                                            {isSelf && <span className="badge admin-self-badge">Du</span>}
                                        </strong>
                                        <span className="muted">{admin.email}</span>
                                    </div>
                                    <div className="recipe-admin-row-actions">
                                        <button
                                            type="button"
                                            className="icon-btn recipe-admin-delete"
                                            onClick={() => changeStatus(admin.email, false)}
                                            disabled={busy || isSelf}
                                            aria-label={`${admin.email} die Admin-Rechte entziehen`}
                                            title={isSelf ? "Die eigenen Rechte kann man nicht entziehen" : "Admin-Rechte entziehen"}
                                        >
                                            <ShieldMinus size={18} />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
