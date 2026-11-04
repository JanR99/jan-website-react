/** The full address of a page of the website, like https://jan-website.de/#/cookbook/ramen. */
export function pageUrl(path: string): string {
    return `${window.location.origin}${window.location.pathname}#${path}`;
}

/**
 * Opens the share menu of the device; where there is none, copies the link instead.
 * Closing the share menu without choosing an app counts as shared.
 * Both only exist on HTTPS pages, so on plain http (the dev server on the phone) the link is copied the old way.
 */
export async function shareLink(title: string, url: string): Promise<"shared" | "copied" | "failed"> {
    if (navigator.share) {
        try {
            await navigator.share({ title, url });
            return "shared";
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return "shared";
        }
    }
    try {
        await navigator.clipboard.writeText(url);
        return "copied";
    } catch {
        return copyWithTextField(url) ? "copied" : "failed";
    }
}

function copyWithTextField(text: string): boolean {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    try {
        return document.execCommand("copy");
    } catch {
        return false;
    } finally {
        field.remove();
    }
}
