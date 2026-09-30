import { apiClient } from "./APIClient.ts";
import {
    LoginRequest, LoginResponse,
    RegisterRequest, SetAdminStatusRequest
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