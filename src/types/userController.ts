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
}

export interface LoginResponse {
    token: string;
    user: UserDTO;
}

export interface SetAdminStatusRequest {
    targetEmail: string;
    admin: boolean;
}
