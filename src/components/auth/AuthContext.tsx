import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiClient } from "../../controller/APIClient.ts";
import UserController from "../../controller/UserController.ts";
import { handleApiError, isUnauthenticated } from "../../controller/util/ErrorHandler.ts";
import { UserDTO } from "../../types/entities.ts";
import {
    ChangePasswordRequest, LoginRequest, LoginResponse, RegisterRequest, UpdateProfileRequest
} from "../../types/userController.ts";
import { Permission } from "../../types/roles.ts";
import {
    getExpiryWarningTime, getTokenExpiry, loadSession, needsRenewal, saveSession, Session,
} from "./sessionStore.ts";
import { retryPause } from "../../utils/retry.ts";

// setTimeout runs at once when its delay is longer than this (about 24.8 days)
const MAX_TIMEOUT = 2 ** 31 - 1;

/**
 * Runs the action at the given time. 30 days are more than one setTimeout can wait, so for a long
 * login the time is checked again in between.
 *
 * @returns cancels it
 */
function runAt(time: number, action: () => void): () => void {
    let timeout = window.setTimeout(function check() {
        const remaining = time - Date.now();
        if (remaining <= 0) {
            action();
        } else {
            timeout = window.setTimeout(check, Math.min(remaining, MAX_TIMEOUT));
        }
    }, Math.max(0, Math.min(time - Date.now(), MAX_TIMEOUT)));
    return () => window.clearTimeout(timeout);
}

export type LoginResult =
    | { ok: true }
    | { ok: false; error: string };

export type AuthDialogMode = "login" | "register" | "forgot";

/** What a user may do. */
interface Rights {
    /** whose permissions these are; they only count while that user is logged in */
    userId: number | null;
    /** null as long as it isn't known: still loading, or it couldn't be loaded so far */
    permissions: Permission[] | null;
    failed: boolean;
}

const UNKNOWN: Rights = { userId: null, permissions: null, failed: false };

interface AuthContextValue {
    user: UserDTO | null;
    isAuthenticated: boolean;
    /** null as long as they are not known, which is not the same as having none */
    permissions: Permission[] | null;
    /** the permissions couldn't be loaded so far; that is tried again by itself */
    permissionsFailed: boolean;
    /** tries to load them again right now */
    retryPermissions: () => void;
    hasPermission: (permission: Permission) => boolean;
    /** when the login ends, once that is only minutes away; null before that */
    sessionEndsAt: number | null;
    /** renews the login, so its time starts again */
    extendSession: () => Promise<LoginResult>;
    login: (request: LoginRequest) => Promise<LoginResult>;
    register: (request: RegisterRequest) => Promise<LoginResult>;
    logout: () => void;
    updateProfile: (request: UpdateProfileRequest) => Promise<LoginResult>;
    changePassword: (request: ChangePasswordRequest) => Promise<LoginResult>;
    deleteAccount: (password: string) => Promise<LoginResult>;

    authDialog: AuthDialogMode | null;
    openAuthDialog: (mode?: AuthDialogMode) => void;
    closeAuthDialog: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(() => {
        const restored = loadSession();
        apiClient.setToken(restored?.token ?? null);
        return restored;
    });
    const [authDialog, setAuthDialog] = useState<AuthDialogMode | null>(null);
    const [rights, setRights] = useState(UNKNOWN);
    /** the token whose end is only minutes away */
    const [endingToken, setEndingToken] = useState<string | null>(null);
    /** counts the tries the user asked for; each one starts the loading below again */
    const [permissionsTry, setPermissionsTry] = useState(0);
    const token = session?.token ?? null;
    const userId = session?.user.id ?? null;
    // Kept across a renewed token of the same user: an admin area shown with them must not start over
    // (and lose what is being written there) just because the login was extended.
    const { permissions, failed: permissionsFailed } = userId !== null && rights.userId === userId ? rights : UNKNOWN;

    const startSession = useCallback((response: LoginResponse) => {
        apiClient.setToken(response.token);
        const next: Session = { token: response.token, user: response.user };
        saveSession(next);
        setSession(next);
    }, []);

    const logout = useCallback(() => {
        apiClient.clearToken();
        saveSession(null);
        setSession(null);
    }, []);

    useEffect(() => {
        if (!token || userId === null) return;
        let active = true;
        let loading = false;
        let failedTries = 0;
        let nextTry: number | undefined;

        const load = () => {
            if (loading) return;
            loading = true;
            window.clearTimeout(nextTry);
            UserController.getPermissions()
                .then((result) => active && setRights({ userId, permissions: result, failed: false }))
                .catch((error) => {
                    if (!active) return;
                    if (isUnauthenticated(error)) {
                        // the backend no longer accepts this login, e.g. after the password was reset on another device
                        logout();
                        return;
                    }
                    // A failed request (backend still waking up, offline) doesn't mean "no permissions":
                    // they stay unknown (or as they were known for this user) and it is tried again,
                    // so the admin functions appear without a reload.
                    failedTries++;
                    setRights((known) =>
                        known.userId === userId && known.permissions !== null
                            ? known
                            : { userId, permissions: null, failed: true }
                    );
                    nextTry = window.setTimeout(load, retryPause(failedTries));
                })
                .finally(() => {
                    loading = false;
                });
        };

        load();
        // no need to wait for the next try when the connection is back
        window.addEventListener("online", load);
        return () => {
            active = false;
            window.clearTimeout(nextTry);
            window.removeEventListener("online", load);
        };
    }, [token, userId, logout, permissionsTry]);

    const retryPermissions = useCallback(() => {
        // back to "loading", so the user sees that something happens
        setRights(UNKNOWN);
        setPermissionsTry((tries) => tries + 1);
    }, []);

    // A login with "Angemeldet bleiben" gets a fresh token on a visit, so its 30 days start again.
    useEffect(() => {
        if (!token || !needsRenewal(token)) return;
        let active = true;
        UserController.renewToken()
            .then((response) => active && startSession(response))
            .catch((error) => {
                // anything else (e.g. being offline) can wait: the current token is valid until it expires
                if (active && isUnauthenticated(error)) logout();
            });
        return () => {
            active = false;
        };
    }, [token, startSession, logout]);

    const login = useCallback(async (request: LoginRequest): Promise<LoginResult> => {
        try {
            startSession(await UserController.login(request));
            return { ok: true };
        } catch (error) {
            return { ok: false, error: handleApiError(error) };
        }
    }, [startSession]);

    const register = useCallback(async (request: RegisterRequest): Promise<LoginResult> => {
        try {
            await UserController.register(request);
        } catch (error) {
            return { ok: false, error: handleApiError(error) };
        }

        // The register endpoint only returns the created user, not a token,
        // so log in right away with the same credentials.
        return login({ email: request.email, password: request.password });
    }, [login]);

    const updateProfile = useCallback(async (request: UpdateProfileRequest): Promise<LoginResult> => {
        try {
            const user = await UserController.updateProfile(request);
            setSession((current) => {
                if (!current) return current;
                const next: Session = { ...current, user };
                saveSession(next);
                return next;
            });
            return { ok: true };
        } catch (error) {
            return { ok: false, error: handleApiError(error) };
        }
    }, []);

    const changePassword = useCallback(async (request: ChangePasswordRequest): Promise<LoginResult> => {
        try {
            // the old token stops working with the change, the answer brings a new one for this device
            startSession(await UserController.changePassword(request));
            return { ok: true };
        } catch (error) {
            return { ok: false, error: handleApiError(error) };
        }
    }, [startSession]);

    const deleteAccount = useCallback(async (password: string): Promise<LoginResult> => {
        try {
            await UserController.deleteAccount({ password });
        } catch (error) {
            return { ok: false, error: handleApiError(error) };
        }
        logout();
        return { ok: true };
    }, [logout]);

    // The login ends by itself; shortly before, the user is told and can extend it (SessionExpiryNotice).
    useEffect(() => {
        if (!token) return;
        const expiry = getTokenExpiry(token);
        const warning = getExpiryWarningTime(token);
        if (expiry === null || warning === null) return;
        const cancelWarning = runAt(warning, () => setEndingToken(token));
        const cancelLogout = runAt(expiry, logout);
        return () => {
            cancelWarning();
            cancelLogout();
        };
    }, [token, logout]);

    const sessionEndsAt = token !== null && token === endingToken ? getTokenExpiry(token) : null;

    const extendSession = useCallback(async (): Promise<LoginResult> => {
        try {
            startSession(await UserController.renewToken());
            return { ok: true };
        } catch (error) {
            if (isUnauthenticated(error)) logout();
            return { ok: false, error: handleApiError(error) };
        }
    }, [startSession, logout]);

    const openAuthDialog = useCallback((mode: AuthDialogMode = "login") => setAuthDialog(mode), []);
    const closeAuthDialog = useCallback(() => setAuthDialog(null), []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user: session?.user ?? null,
            isAuthenticated: session !== null,
            permissions,
            permissionsFailed,
            retryPermissions,
            hasPermission: (permission: Permission) => permissions?.includes(permission) ?? false,
            sessionEndsAt,
            extendSession,
            login,
            register,
            logout,
            updateProfile,
            changePassword,
            deleteAccount,
            authDialog,
            openAuthDialog,
            closeAuthDialog,
        }),
        [
            session, permissions, permissionsFailed, retryPermissions, sessionEndsAt, extendSession, login, register,
            logout, updateProfile, changePassword, deleteAccount, authDialog, openAuthDialog, closeAuthDialog,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside an <AuthProvider>");
    }
    return context;
}