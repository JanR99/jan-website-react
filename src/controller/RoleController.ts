import { apiClient } from "./APIClient.ts";
import { RoleDTO, RoleRequest } from "../types/roles.ts";

export default class RoleController {

    static async listRoles(): Promise<RoleDTO[]> {
        const apis = await apiClient;
        const response: { body: RoleDTO[] } = await apis.roles.listRoles.execute({});
        return response.body ?? [];
    }

    static async createRole(req: RoleRequest): Promise<RoleDTO> {
        const apis = await apiClient;
        const response: { body: RoleDTO } = await apis.roles.createRole.execute({}, { requestBody: req });
        return response.body;
    }

    static async updateRole(id: number, req: RoleRequest): Promise<RoleDTO> {
        const apis = await apiClient;
        const response: { body: RoleDTO } = await apis.roles.updateRole.execute({ id }, { requestBody: req });
        return response.body;
    }

    static async deleteRole(id: number): Promise<void> {
        const apis = await apiClient;
        await apis.roles.deleteRole.execute({ id });
    }
}
