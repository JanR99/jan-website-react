import { apiClient } from "./APIClient.ts";
import {
    DeleteAccountRequest, LoginRequest, LoginResponse, PasswordResetRequest,
    RegisterRequest, ResetPasswordRequest, UpdateProfileRequest
} from "../types/userController.ts";
import { Permission } from "../types/roles.ts";
import {UserDTO} from "../types/entities.ts";

export default class UserController {

    static async register(req: RegisterRequest) : Promise<UserDTO> {
        const apis = await apiClient;
        return apis.user.register.execute({}, { requestBody: req });
    }

    static async login(req: LoginRequest) : Promise<LoginResponse> {
        const apis = await apiClient;
        return apis.user.login.execute({}, { requestBody: req });
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

    static async getUserByEmail(email: string): Promise<UserDTO> {
        const apis = await apiClient;
        return apis.user.getUserByEmail.execute({
            email,
        });
    }
}
