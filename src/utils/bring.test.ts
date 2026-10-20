import { afterEach, describe, expect, it, vi } from "vitest";
import { apiUrl } from "../controller/APIClient";
import { bringImportUrl, bringPageUrl } from "./bring";

describe("bringImportUrl", () => {
    it("asks Bring! for the page with the portions of the recipe and the ones asked for", () => {
        const url = new URL(bringImportUrl("https://backend.example.com/api/recipes/7/bring", 2, 5));

        expect(url.origin + url.pathname).toBe("https://api.getbring.com/rest/bringrecipes/deeplink");
        expect(url.searchParams.get("url")).toBe("https://backend.example.com/api/recipes/7/bring");
        expect(url.searchParams.get("source")).toBe("web");
        expect(url.searchParams.get("baseQuantity")).toBe("2");
        expect(url.searchParams.get("requestedQuantity")).toBe("5");
    });

    it("encodes the page address, so its own query stays in one parameter", () => {
        const url = bringImportUrl("https://backend.example.com/page?a=1&b=2", 4, 4);

        expect(url).toContain("url=https%3A%2F%2Fbackend.example.com%2Fpage%3Fa%3D1%26b%3D2");
    });
});

describe("bringPageUrl", () => {
    afterEach(() => vi.unstubAllEnvs());

    it("points to the page of the recipe in the backend", () => {
        vi.stubEnv("VITE_BRING_BACKEND_URL", "");

        expect(bringPageUrl(7)).toBe(apiUrl("/api/recipes/7/bring"));
    });

    it("points to the tunnel when one is set for local tests", () => {
        vi.stubEnv("VITE_BRING_BACKEND_URL", "https://abc.trycloudflare.com/");

        expect(bringPageUrl(7)).toBe("https://abc.trycloudflare.com/api/recipes/7/bring");
    });
});
