import { apiClient } from "./APIClient.ts";
import {
    LoginRequest, LoginResponse, PasswordResetRequest,
    RegisterRequest, ResetPasswordRequest, SetAdminStatusRequest
} from "../types/userController.ts";
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

    static async getUserByEmail(email: string): Promise<UserDTO> {
        const apis = await apiClient;
        return apis.user.getUserByEmail.execute({
            email,
        });
    }

    static async setAdminStatus(req: SetAdminStatusRequest): Promise<UserDTO> {
        const apis = await apiClient;
        return apis.user.setAdminStatus.execute({}, { requestBody: req });
    }
}