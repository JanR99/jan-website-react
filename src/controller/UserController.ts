import { apiClient } from "./APIClient.ts";
import {
    LoginRequest,
    RegisterRequest
} from "../types/userController.ts";

export default class UserController {

    static register(req: RegisterRequest) {
        return apiClient.then((apis: any) => {
            return apis.user.register({
                requestBody: req,
            });
        });
    }

    static login(req: LoginRequest) {
        return apiClient.then((apis: any) => {
            return apis.user.login({
                requestBody: req,
            });
        });
    }

    static getUserByEmail(email: string) {
        return apiClient.then((apis: any) => {
            return apis.user.getUserByEmail({
                email,
            });
        });
    }

    static setAdminStatus(targetEmail: string, isAdmin: boolean) {
        return apiClient.then((apis: any) => {
            return apis.user.setAdminStatus({
                requestBody: {
                    targetEmail,
                    admin: isAdmin,
                },
            });
        });
    }
}