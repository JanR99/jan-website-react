import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiClient } from "../../controller/APIClient.ts";
import UserController from "../../controller/UserController.ts";
import { handleApiError } from "../../controller/util/ErrorHandler.ts";
import { UserDTO } from "../../types/entities.ts";
import { LoginRequest, RegisterRequest, UpdateProfileRequest } from "../../types/userController.ts";
import { Permission } from "../../types/roles.ts";

const STORAGE_KEY = "jan-website-session";

interface Session {
    token: string;
    user: UserDTO;
}

export type LoginResult =
    | { ok: true }
    | { ok: false; error: string };

export type AuthDialogMode = "login" | "register" | "forgot";

interface AuthContextValue {
    user: UserDTO | null;
    isAuthenticated: boolean;
    permissions: Permission[] | null;
    hasPermission: (permission: Permission) => boolean;
    login: (request: LoginRequest) => Promise<LoginResult>;
    register: (request: RegisterRequest) => Promise<LoginResult>;
    logout: () => void;
    updateProfile: (request: UpdateProfileRequest) => Promise<LoginResult>;
    deleteAccount: (password: string) => Promise<LoginResult>;

    authDialog: AuthDialogMode | null;
    openAuthDialog: (mode?: AuthDialogMode) => void;
    closeAuthDialog: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function getTokenExpiry(token: string): number | null {
    try {
        const payload = token.split(".")[1];
        const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return typeof json.exp === "number" ? json.exp * 1000 : null;
    } catch {
        return null;
    }
}

function isExpired(token: string): boolean {
    const expiry = getTokenExpiry(token);
    return expiry !== null && expiry <= Date.now();
}

// sessionStorage keeps the login across page reloads, but not across browser sessions.
// Every access is wrapped in try/catch because storage can be unavailable (e.g. private mode).
function loadSession(): Session | null {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw) as Session;
        return isExpired(session.token) ? null : session;
    } catch {
        return null;
    }
}

function saveSession(session: Session | null) {
    try {
        if (session) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } else {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // Storage unavailable: the session then only lives in memory
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(() => {
        const restored = loadSession();
        apiClient.setToken(restored?.token ?? null);
        return restored;
    });
    const [authDialog, setAuthDialog] = useState<AuthDialogMode | null>(null);
    const [permissions, setPermissions] = useState<Permission[] | null>(null);
    const token = session?.token ?? null;

    useEffect(() => {
        setPermissions(null);
        if (!token) return;
        let active = true;
        UserController.getPermissions()
            .then((result) => active && setPermissions(result))
            .catch(() => active && setPermissions([]));
        return () => {
            active = false;
        };
    }, [token]);

    const login = useCallback(async (request: LoginRequest): Promise<LoginResult> => {
        try {
            const response = await UserController.login(request);
            apiClient.setToken(response.body.token);
            const next: Session = { token: response.body.token, user: response.body.user };
            saveSession(next);
            setSession(next);
            return { ok: true };
        } catch (error) {
            return { ok: false, error: handleApiError(error) };
        }
    }, []);

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

    const logout = useCallback(() => {
        apiClient.clearToken();
        saveSession(null);
        setSession(null);
    }, []);

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

    const deleteAccount = useCallback(async (password: string): Promise<LoginResult> => {
        try {
            await UserController.deleteAccount({ password });
        } catch (error) {
            return { ok: false, error: handleApiError(error) };
        }
        logout();
        return { ok: true };
    }, [logout]);

    useEffect(() => {
        if (!session) return;
        const expiry = getTokenExpiry(session.token);
        if (expiry === null) return;
        const timeout = window.setTimeout(logout, Math.max(0, expiry - Date.now()));
        return () => window.clearTimeout(timeout);
    }, [session, logout]);

    const openAuthDialog = useCallback((mode: AuthDialogMode = "login") => setAuthDialog(mode), []);
    const closeAuthDialog = useCallback(() => setAuthDialog(null), []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user: session?.user ?? null,
            isAuthenticated: session !== null,
            permissions,
            hasPermission: (permission: Permission) => permissions?.includes(permission) ?? false,
            login,
            register,
            logout,
            updateProfile,
            deleteAccount,
            authDialog,
            openAuthDialog,
            closeAuthDialog,
        }),
        [session, permissions, login, register, logout, updateProfile, deleteAccount, authDialog, openAuthDialog, closeAuthDialog]
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