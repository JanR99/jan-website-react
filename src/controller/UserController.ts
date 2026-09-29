import { apiClient } from "./APIClient.ts";
import {
    LoginRequest,
    RegisterRequest
} from "../types/userController.ts";

export default class UserController {

    static async register(req: RegisterRequest) {
        const apis = await apiClient;
        return apis.user.register.execute({}, { requestBody: req });
    }

    static async login(req: LoginRequest) {
        const apis = await apiClient;
        return apis.user.login.execute({}, { requestBody: req });
    }

    static async getUserByEmail(email: string) {
        const apis = await apiClient;
        return apis.user.getUserByEmail.execute({
            email,
        });
    }

    static async setAdminStatus(targetEmail: string, isAdmin: boolean) {
        const apis = await apiClient;
        return apis.user.setAdminStatus.execute(
            {},
            { requestBody: { targetEmail, admin: isAdmin } }
        );
    }
}