import {UserDTO} from "./entities.ts";

export interface RegisterRequest {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    /** "Angemeldet bleiben": the login then lasts 30 days instead of 2 hours */
    rememberMe?: boolean;
}

export interface LoginResponse {
    token: string;
    user: UserDTO;
}

export interface PasswordResetRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export interface UpdateProfileRequest {
    firstname: string;
    lastname: string;
}

export interface DeleteAccountRequest {
    password: string;
}

