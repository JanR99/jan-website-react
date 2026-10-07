export function handleApiError(error: unknown): string {
    const err = error as {
        response?: { body?: unknown; data?: unknown; text?: string };
    };

    const body = err.response?.body ?? err.response?.data;

    if (typeof body === "string" && body.trim().length > 0) {
        return body;
    }

    if (body && typeof body === "object" && "message" in body) {
        const message = (body as { message: unknown }).message;
        if (typeof message === "string" && message.trim().length > 0) {
            return message;
        }
    }

    const text = err.response?.text;
    if (typeof text === "string" && text.trim().length > 0) {
        try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === "object" && typeof parsed.message === "string") {
                return parsed.message;
            }
        } catch {
            // not JSON, fall through and use the raw text
        }
        return text;
    }

    return "Gerade nicht verfügbar. Bitte später erneut versuchen.";
}

/** true if the backend did not accept the login itself: the token is missing, expired or no longer valid */
export function isUnauthenticated(error: unknown): boolean {
    const err = error as { status?: number; response?: { status?: number } } | null | undefined;
    return (err?.response?.status ?? err?.status) === 401;
}
