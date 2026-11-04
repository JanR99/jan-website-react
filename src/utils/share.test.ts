import { afterEach, describe, expect, it, vi } from "vitest";
import { pageUrl, shareLink } from "./share";

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

function stubNavigator(share?: () => Promise<void>, writeText: () => Promise<void> = () => Promise.resolve()) {
    vi.stubGlobal("navigator", { share, clipboard: { writeText: vi.fn(writeText) } });
}

function stubOldCopy(works: boolean) {
    // jsdom has no execCommand
    const execCommand = vi.fn(() => works);
    Object.defineProperty(document, "execCommand", { value: execCommand, configurable: true });
    return execCommand;
}

describe("pageUrl", () => {
    it("puts the path behind the hash of the current address", () => {
        expect(pageUrl("/cookbook/ramen")).toBe(`${window.location.origin}${window.location.pathname}#/cookbook/ramen`);
    });
});

describe("shareLink", () => {
    it("opens the share menu where there is one", async () => {
        const share = vi.fn(() => Promise.resolve());
        stubNavigator(share);

        expect(await shareLink("Ramen", "https://example.com/#/cookbook/ramen")).toBe("shared");
        expect(share).toHaveBeenCalledWith({ title: "Ramen", url: "https://example.com/#/cookbook/ramen" });
        expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });

    it("copies nothing when the share menu is closed", async () => {
        stubNavigator(() => Promise.reject(new DOMException("closed", "AbortError")));

        expect(await shareLink("Ramen", "https://example.com/")).toBe("shared");
        expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });

    it("copies the link without a share menu or when sharing is not allowed", async () => {
        stubNavigator(undefined);
        expect(await shareLink("Ramen", "https://example.com/")).toBe("copied");
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://example.com/");

        stubNavigator(() => Promise.reject(new DOMException("no", "NotAllowedError")));
        expect(await shareLink("Ramen", "https://example.com/")).toBe("copied");
    });

    it("copies the old way on plain http, where there is neither share menu nor clipboard", async () => {
        vi.stubGlobal("navigator", {});
        const execCommand = stubOldCopy(true);

        expect(await shareLink("Ramen", "http://192.168.0.2:5173/")).toBe("copied");
        expect(execCommand).toHaveBeenCalledWith("copy");
        expect(document.querySelector("textarea")).toBeNull();
    });

    it("says when nothing works", async () => {
        stubNavigator(undefined, () => Promise.reject(new Error("denied")));
        stubOldCopy(false);

        expect(await shareLink("Ramen", "https://example.com/")).toBe("failed");
    });
});
