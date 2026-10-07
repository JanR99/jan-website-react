import { apiClient } from "./APIClient.ts";
import {
    DeleteAccountRequest, LoginRequest, LoginResponse, PasswordResetRequest,
    RegisterRequest, ResetPasswordRequest, UpdateProfileRequest
} from "../types/userController.ts";
import { Permission, SetRolesRequest, UserAdminDTO } from "../types/roles.ts";
import {UserDTO} from "../types/entities.ts";

export default class UserController {

    static async register(req: RegisterRequest) : Promise<UserDTO> {
        const apis = await apiClient;
        const response: { body: UserDTO } = await apis.user.register.execute({}, { requestBody: req });
        return response.body;
    }

    static async login(req: LoginRequest) : Promise<LoginResponse> {
        const apis = await apiClient;
        const response: { body: LoginResponse } = await apis.user.login.execute({}, { requestBody: req });
        return response.body;
    }

    /** Only for a login with "Angemeldet bleiben": the new token is valid for another 30 days. */
    static async renewToken() : Promise<LoginResponse> {
        const apis = await apiClient;
        const response: { body: LoginResponse } = await apis.user.renewToken.execute({});
        return response.body;
    }

    static async requestPasswordReset(req: PasswordResetRequest): Promise<void> {
        const apis = await apiClient;
        await apis.user.requestPasswordReset.execute({}, { requestBody: req });
    }

    static async resetPassword(req: ResetPasswordRequest): Promise<void> {
        const apis = await apiClient;
        await apis.user.resetPassword.execute({}, { requestBody: req });
    }

    static async updateProfile(req: UpdateProfileRequest): Promise<UserDTO> {
        const apis = await apiClient;
        const response: { body: UserDTO } = await apis.user.updateProfile.execute({}, { requestBody: req });
        return response.body;
    }

    static async deleteAccount(req: DeleteAccountRequest): Promise<void> {
        const apis = await apiClient;
        await apis.user.deleteAccount.execute({}, { requestBody: req });
    }

    static async getPermissions(): Promise<Permission[]> {
        const apis = await apiClient;
        const response: { body: Permission[] } = await apis.user.getPermissions.execute({});
        return response.body ?? [];
    }

    /** undefined if there is no user with this email (the backend then answers without content) */
    static async getUserByEmail(email: string): Promise<UserDTO | undefined> {
        const apis = await apiClient;
        const response: { body?: UserDTO } = await apis.user.getUserByEmail.execute({ email });
        return response.body;
    }

    static async listUsers(): Promise<UserAdminDTO[]> {
        const apis = await apiClient;
        const response: { body: UserAdminDTO[] } = await apis.user.listUsers.execute({});
        return response.body ?? [];
    }

    static async setRoles(req: SetRolesRequest): Promise<UserAdminDTO> {
        const apis = await apiClient;
        const response: { body: UserAdminDTO } = await apis.user.setRoles.execute({}, { requestBody: req });
        return response.body;
    }
}