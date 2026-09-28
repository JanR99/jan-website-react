import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiClient } from "../../controller/APIClient.ts";
import UserController from "../../controller/UserController.ts";
import {UserDTO} from "../../types/entities.ts";
import {LoginRequest, LoginResponse} from "../../types/userController.ts";

const STORAGE_KEY = "jan-website-session";

interface Session {
    token: string;
    user: UserDTO;
}

export type LoginResult =
    | { ok: true }
    | { ok: false; error: "invalid-credentials" | "unavailable" };

interface AuthContextValue {
    user: UserDTO | null;
    login: (request: LoginRequest) => Promise<LoginResult>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// sessionStorage keeps the login across page reloads, but not across browser sessions.
// Every access is wrapped in try/catch because storage can be unavailable (e.g. private mode).
function loadSession(): Session | null {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Session) : null;
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

    const login = useCallback(async (request: LoginRequest): Promise<LoginResult> => {
        try {
            const response = await UserController.login(request);
            const body = (response.body ?? response.obj) as LoginResponse;

            apiClient.setToken(body.token);
            const next: Session = { token: body.token, user: body.user };
            saveSession(next);
            setSession(next);
            return { ok: true };
        } catch (error) {
            // swagger-client rejects non-2xx answers with an error that carries the HTTP status.
            // No status at all means the backend could not be reached (or the spec failed to load).
            const status = (error as { status?: number })?.status;
            if (status === 400 || status === 401) {
                return { ok: false, error: "invalid-credentials" };
            }
            return { ok: false, error: "unavailable" };
        }
    }, []);

    const logout = useCallback(() => {
        apiClient.clearToken();
        saveSession(null);
        setSession(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ user: session?.user ?? null, login, logout }),
        [session, login, logout]
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