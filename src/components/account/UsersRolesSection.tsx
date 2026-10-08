import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import RoleController from "../../controller/RoleController";
import UserController from "../../controller/UserController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { ALL_PERMISSIONS, Permission, PERMISSIONS, RoleDTO, UserAdminDTO } from "../../types/roles";
import Avatar from "../ui/Avatar";
import Dialog from "../ui/Dialog";
import { Lock, Pencil, Plus, Search, Trash2, UserCog } from "lucide-react";

type RoleEdit = { role: RoleDTO | null } | null;

export default function UsersRolesSection() {
    const { user, permissions, hasPermission } = useAuth();
    const canManage = hasPermission("MANAGE_USERS");

    const [roles, setRoles] = useState<RoleDTO[] | null>(null);
    const [users, setUsers] = useState<UserAdminDTO[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const [roleEdit, setRoleEdit] = useState<RoleEdit>(null);
    const [roleToDelete, setRoleToDelete] = useState<RoleDTO | null>(null);
    const [userToEdit, setUserToEdit] = useState<UserAdminDTO | null>(null);
    const [search, setSearch] = useState("");

    const load = useCallback(() => {
        Promise.all([RoleController.listRoles(), UserController.listUsers()])
            .then(([loadedRoles, loadedUsers]) => {
                setRoles(loadedRoles);
                setUsers(loadedUsers);
            })
            .catch((err) => {
                setError(handleApiError(err));
                setRoles((prev) => prev ?? []);
                setUsers((prev) => prev ?? []);
            });
    }, []);

    useEffect(() => {
        if (canManage) load();
    }, [canManage, load]);

    const roleById = useMemo(() => new Map((roles ?? []).map((role) => [role.id, role])), [roles]);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!users || !term) return users ?? [];
        return users.filter((u) =>
            [u.email, u.firstname, u.lastname].some((value) => value?.toLowerCase().includes(term))
        );
    }, [users, search]);

    function done(message: string) {
        setError(null);
        setNotice(message);
        load();
    }

    if (permissions === null) {
        return <div className="loading"><div className="spinner" /></div>;
    }

    if (!canManage) {
        return (
            <div className="card empty-state">
                <span className="empty-state-icon"><Lock size={26} /></span>
                <h3>Keine Berechtigung</h3>
                <p>Für diesen Bereich brauchst du das Recht „{PERMISSIONS.MANAGE_USERS}“.</p>
            </div>
        );
    }

    return (
        <div className="account-stack">
            {notice && <p className="form-message form-message--success" role="status">{notice}</p>}
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}

            {/* Rollen */}
            <div className="card card-pad">
                <div className="account-card-head">
                    <h2 className="account-card-title">Rollen</h2>
                    {!roleEdit && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRoleEdit({ role: null })}>
                            <Plus size={16} />
                            Neue Rolle
                        </button>
                    )}
                </div>

                {roleEdit && (
                    <RoleForm
                        role={roleEdit.role}
                        onCancel={() => setRoleEdit(null)}
                        onSaved={(saved) => {
                            setRoleEdit(null);
                            done(`Rolle „${saved.name}“ wurde gespeichert.`);
                        }}
                    />
                )}

                {roles === null ? (
                    <div className="loading"><div className="spinner" /></div>
                ) : (
                    <ul className="role-list">
                        {roles.map((role) => (
                            <li key={role.id} className="recipe-admin-row">
                                <div className="recipe-admin-row-text">
                                    <strong>
                                        {role.name}
                                        {role.system && <span className="badge admin-self-badge">System</span>}
                                    </strong>
                                    <span className="muted">
                                        {role.permissions.length > 0
                                            ? role.permissions.map((p) => PERMISSIONS[p]).join(" · ")
                                            : "Keine Rechte"}
                                    </span>
                                </div>
                                <div className="recipe-admin-row-actions">
                                    <button
                                        type="button"
                                        className="icon-btn"
                                        onClick={() => setRoleEdit({ role })}
                                        disabled={role.system}
                                        aria-label={`Rolle ${role.name} bearbeiten`}
                                        title={role.system ? "Die Systemrolle kann nicht geändert werden" : "Bearbeiten"}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        className="icon-btn recipe-admin-delete"
                                        onClick={() => setRoleToDelete(role)}
                                        disabled={role.system}
                                        aria-label={`Rolle ${role.name} löschen`}
                                        title={role.system ? "Die Systemrolle kann nicht gelöscht werden" : "Löschen"}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Nutzer */}
            <div className="card card-pad">
                <div className="account-card-head">
                    <h2 className="account-card-title">Nutzer</h2>
                </div>
                <label className="input-with-icon users-search">
                    <Search size={18} />
                    <input
                        className="input"
                        type="search"
                        placeholder="Nach Name oder E-Mail suchen …"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Nutzer suchen"
                    />
                </label>

                {users === null ? (
                    <div className="loading"><div className="spinner" /></div>
                ) : filteredUsers.length === 0 ? (
                    <p className="muted recipe-admin-empty">Keine Nutzer gefunden.</p>
                ) : (
                    <ul className="role-list">
                        {filteredUsers.map((u) => (
                            <li key={u.id} className="recipe-admin-row">
                                <Avatar user={u} size={40} />
                                <div className="recipe-admin-row-text">
                                    <strong>
                                        {[u.firstname, u.lastname].filter(Boolean).join(" ") || u.email}
                                        {u.email === user?.email && <span className="badge admin-self-badge">Du</span>}
                                    </strong>
                                    <span className="muted">{u.email}</span>
                                    {u.roleIds.length > 0 && (
                                        <span className="user-role-badges">
                                            {u.roleIds.map((id) => (
                                                <span key={id} className="badge">{roleById.get(id)?.name ?? `Rolle ${id}`}</span>
                                            ))}
                                        </span>
                                    )}
                                </div>
                                <div className="recipe-admin-row-actions">
                                    <button
                                        type="button"
                                        className="icon-btn"
                                        onClick={() => setUserToEdit(u)}
                                        aria-label={`Rollen von ${u.email} bearbeiten`}
                                        title="Rollen bearbeiten"
                                    >
                                        <UserCog size={18} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <DeleteRoleDialog
                role={roleToDelete}
                onClose={() => setRoleToDelete(null)}
                onDeleted={(role) => {
                    setRoleToDelete(null);
                    done(`Rolle „${role.name}“ wurde gelöscht.`);
                }}
            />

            {/* the key starts the dialog from scratch for every user: their roles, no old error */}
            <UserRolesDialog
                key={userToEdit?.id ?? "closed"}
                user={userToEdit}
                roles={roles ?? []}
                onClose={() => setUserToEdit(null)}
                onSaved={(saved) => {
                    setUserToEdit(null);
                    done(`Die Rollen von ${saved.email} wurden gespeichert.`);
                }}
            />
        </div>
    );
}

function RoleForm({ role, onCancel, onSaved }: {
    role: RoleDTO | null;
    onCancel: () => void;
    onSaved: (role: RoleDTO) => void;
}) {
    const [name, setName] = useState(role?.name ?? "");
    const [selected, setSelected] = useState<Permission[]>(role?.permissions ?? []);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function toggle(permission: Permission) {
        setSelected((prev) => (prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]));
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!name.trim()) {
            setError("Der Name darf nicht leer sein.");
            return;
        }
        setBusy(true);
        setError(null);
        const request = { name: name.trim(), permissions: ALL_PERMISSIONS.filter((p) => selected.includes(p)) };
        try {
            const saved = role
                ? await RoleController.updateRole(role.id, request)
                : await RoleController.createRole(request);
            onSaved(saved);
        } catch (err) {
            setError(handleApiError(err));
            setBusy(false);
        }
    }

    return (
        <form className="profile-form role-form" onSubmit={handleSubmit}>
            <label className="field">
                Name
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} autoFocus required />
            </label>
            <fieldset className="field role-permissions">
                <legend>Rechte</legend>
                {ALL_PERMISSIONS.map((permission) => (
                    <label key={permission} className="checkbox-row">
                        <input type="checkbox" checked={selected.includes(permission)} onChange={() => toggle(permission)} />
                        {PERMISSIONS[permission]}
                    </label>
                ))}
            </fieldset>
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
            <div className="profile-form-actions">
                <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>Abbrechen</button>
                <button type="submit" className="btn" disabled={busy}>
                    {busy ? "Speichern …" : role ? "Änderungen speichern" : "Rolle anlegen"}
                </button>
            </div>
        </form>
    );
}

function DeleteRoleDialog({ role, onClose, onDeleted }: {
    role: RoleDTO | null;
    onClose: () => void;
    onDeleted: (role: RoleDTO) => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function close() {
        if (busy) return;
        setError(null);
        onClose();
    }

    async function confirm() {
        if (!role) return;
        setBusy(true);
        setError(null);
        try {
            await RoleController.deleteRole(role.id);
            onDeleted(role);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={role !== null} onClose={close} labelledBy="delete-role-title" className="confirm-dialog">
            <h2 id="delete-role-title">Rolle löschen?</h2>
            <p className="muted">„{role?.name}“ wird gelöscht und allen Nutzern entzogen, die sie haben.</p>
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
            <div className="profile-form-actions">
                <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>Abbrechen</button>
                <button type="button" className="btn btn-danger" onClick={confirm} disabled={busy}>
                    {busy ? "Wird gelöscht …" : "Löschen"}
                </button>
            </div>
        </Dialog>
    );
}

function UserRolesDialog({ user, roles, onClose, onSaved }: {
    user: UserAdminDTO | null;
    roles: RoleDTO[];
    onClose: () => void;
    onSaved: (user: UserAdminDTO) => void;
}) {
    const [selected, setSelected] = useState<number[]>(user?.roleIds ?? []);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function close() {
        if (!busy) onClose();
    }

    function toggle(id: number) {
        setSelected((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!user) return;
        setBusy(true);
        setError(null);
        try {
            onSaved(await UserController.setRoles({ email: user.email, roleIds: selected }));
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={user !== null} onClose={close} labelledBy="user-roles-title" className="confirm-dialog">
            <h2 id="user-roles-title">Rollen bearbeiten</h2>
            <p className="muted">{user?.email}</p>
            <form className="profile-form" onSubmit={handleSubmit}>
                <fieldset className="field role-permissions">
                    <legend>Rollen</legend>
                    {roles.length === 0 && <span className="muted">Es gibt noch keine Rollen.</span>}
                    {roles.map((role) => (
                        <label key={role.id} className="checkbox-row">
                            <input type="checkbox" checked={selected.includes(role.id)} onChange={() => toggle(role.id)} />
                            <span>
                                {role.name}
                                <span className="muted checkbox-hint">
                                    {role.permissions.map((p) => PERMISSIONS[p]).join(" · ") || "Keine Rechte"}
                                </span>
                            </span>
                        </label>
                    ))}
                </fieldset>
                {error && <p className="form-message form-message--error" role="alert">{error}</p>}
                <div className="profile-form-actions">
                    <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>Abbrechen</button>
                    <button type="submit" className="btn" disabled={busy}>{busy ? "Speichern …" : "Speichern"}</button>
                </div>
            </form>
        </Dialog>
    );
}
