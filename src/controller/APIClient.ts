function resolveApiBase(): string {
    if (import.meta.env.DEV) {
        return `${window.location.protocol}//${window.location.hostname}:8080`;
    }
    return import.meta.env.VITE_API_BASE_URL;
}

const APP_PATH = resolveApiBase();

/** Absolute URL of a backend path, e.g. for <img src> */
export const apiUrl = (path: string) => `${APP_PATH}${path}`;
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

        // @ts-ignore
        const { default: SwaggerClient } = await import("swagger-client");
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

    setToken(token: string | null) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    clearToken() {
        this.token = null;
    }

    async getOperation(tag: string, operationId: string) {
        const apis = await this.apis;

        if (!apis[tag]?.[operationId]) {
            throw new Error(
                `Operation ${tag}.${operationId} not found in OpenAPI specification`
            );
        }

        return apis[tag][operationId];
    }

    async getHttpMethod(tag: string, operationId: string) {
        return (await this.getOperation(tag, operationId)).httpMethod;
    }

    async getPath(tag: string, operationId: string) {
        return (await this.getOperation(tag, operationId)).path;
    }
}

export const apiClient = new APIClient();

/** What a controller awaits to get the operations: apiClient asks the backend, storedApi doesn't. */
export type Api = PromiseLike<any>;

/** What the service worker has stored for a URL; fails when there is nothing. */
async function stored(url: string): Promise<any> {
    const response = await caches.match(url, { ignoreVary: true });
    if (!response) throw new Error(`Nothing stored for ${url}`);
    return response.json();
}

async function loadStoredApis() {
    const { paths = {} } = await stored(DISCOVERY_URL);
    const apis: any = {};
    for (const [path, methods] of Object.entries<any>(paths)) {
        // only answers to GET are stored
        const operation = methods.get;
        for (const tag of operation?.tags ?? []) {
            apis[tag] ??= {};
            apis[tag][operation.operationId] = {
                ...operation,
                httpMethod: "GET",
                path,
                execute: async () => ({ body: await stored(apiUrl(path)) }),
            };
        }
    }
    return apis;
}

/**
 * Looks like apiClient to a controller, but never asks the backend: the operations come from the API
 * description the service worker has stored, and execute answers with the stored copy of the response.
 * So it answers at once, also while the backend still wakes up.
 *
 * Fails when the description or the answer is not stored (first visit, dev server, operation that
 * isn't kept for offline use), so that "nothing stored" can't be mistaken for an empty answer.
 */
export const storedApi: Api = {
    then: (onfulfilled, onrejected) => loadStoredApis().then(onfulfilled, onrejected),
};