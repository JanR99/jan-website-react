// @ts-ignore
import SwaggerClient from "swagger-client";

const APP_PATH = import.meta.env.VITE_API_BASE_URL ?? `${self.location.protocol}//${self.location.host}`;
const DISCOVERY_URL = `${APP_PATH}/v3/api-docs`;

class APIClient {

    private token: string | null = null;
    private apisPromise: Promise<any> | null = null;

    private get apis(): Promise<any> {
        if (!this.apisPromise) {
            const promise = this.loadApis();
            this.apisPromise = promise;
            promise.catch(() => {
                if (this.apisPromise === promise) {
                    this.apisPromise = null;
                }
            });
            return promise;
        }
        return this.apisPromise;
    }

    public then = <T, R = never>(
        onfulfilled: (apis: any) => T | PromiseLike<T>,
        onrejected?: (reason: any) => R | PromiseLike<R>
    ): Promise<T | R> => {
        return this.apis.then(onfulfilled, onrejected);
    };

    private async loadApis() {
        const requestInterceptor = (request: any) => {
            if (!request.loadSpec && this.token) {
                request.headers["Authorization"] = `Bearer ${this.token}`;
            }
            return request;
        };

        const swaggerClient: any = await SwaggerClient(DISCOVERY_URL, {
            requestInterceptor,
        });

        swaggerClient.spec.servers = [{ url: APP_PATH }];

        const {
            spec: { paths },
            apis,
        } = swaggerClient;

        const operations = Object.entries(paths).flatMap(
            ([path, methods]: [string, any]) =>
                Object.entries(methods).map(
                    ([httpMethod, operation]: [string, any]) => ({
                        ...operation,
                        httpMethod: httpMethod.toUpperCase(),
                        path,
                    })
                )
        );

        return Object.fromEntries(
            Object.entries(apis).map(
                ([tag, apiMethods]: [string, any]) => [
                    tag,
                    Object.fromEntries(
                        Object.entries(apiMethods).map(
                            ([operationId, apiMethod]: [string, any]) => {
                                const operation = operations.find(
                                    (operation: any) =>
                                        operation.tags?.includes(tag) &&
                                        operation.operationId === operationId
                                );

                                return [
                                    operationId,
                                    {
                                        ...operation,
                                        execute: apiMethod,
                                    },
                                ];
                            }
                        )
                    ),
                ]
            )
        );
    }
}

export const apiClient = new APIClient();