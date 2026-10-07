import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiClient } from "../../controller/APIClient.ts";
import UserController from "../../controller/UserController.ts";
import { handleApiError, isUnauthenticated } from "../../controller/util/ErrorHandler.ts";
import { UserDTO } from "../../types/entities.ts";
import { LoginRequest, LoginResponse, RegisterRequest, UpdateProfileRequest } from "../../types/userController.ts";
import { Permission } from "../../types/roles.ts";
import { getTokenExpiry, loadSession, needsRenewal, saveSession, Session } from "./sessionStore.ts";

// setTimeout runs at once when its delay is longer than this (about 24.8 days)
const MAX_TIMEOUT = 2 ** 31 - 1;

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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(() => {
        const restored = loadSession();
        apiClient.setToken(restored?.token ?? null);
        return restored;
    });
    const [authDialog, setAuthDialog] = useState<AuthDialogMode | null>(null);
    const [permissions, setPermissions] = useState<Permission[] | null>(null);
    const token = session?.token ?? null;

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
        setPermissions(null);
        if (!token) return;
        let active = true;
        UserController.getPermissions()
            .then((result) => active && setPermissions(result))
            .catch((error) => {
                if (!active) return;
                if (isUnauthenticated(error)) {
                    // the backend no longer accepts this login, e.g. after the password was reset on another device
                    logout();
                } else {
                    setPermissions([]);
                }
            });
        return () => {
            active = false;
        };
    }, [token, logout]);

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
        // 30 days are more than one setTimeout can wait, so a long login is checked again in between
        let timeout = window.setTimeout(function check() {
            const remaining = expiry - Date.now();
            if (remaining <= 0) {
                logout();
            } else {
                timeout = window.setTimeout(check, Math.min(remaining, MAX_TIMEOUT));
            }
        }, Math.max(0, Math.min(expiry - Date.now(), MAX_TIMEOUT)));
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