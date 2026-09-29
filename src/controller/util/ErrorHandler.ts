export function handleApiError(error: any): string {
    const errorBody = (error as { response?: { data?: any } })?.response?.data;

    if (typeof errorBody === "string") {
        return errorBody;
    }

    if (errorBody && typeof errorBody === "object" && "message" in errorBody) {
        return String(errorBody.message);
    }

    return "Gerade nicht verfügbar. Bitte später erneut versuchen.";
}
