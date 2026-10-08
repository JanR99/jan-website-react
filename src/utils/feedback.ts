import { FeedbackDTO } from "../types/feedback";

export const FEEDBACK_MAX_LENGTH = 2000;

const SITE_URL = "https://jan-website.de";
const NEW_GITHUB_ISSUE = "https://github.com/JanR99/jan-website-react/issues/new";
const TITLE_MAX_LENGTH = 70;

/** The first line of the text as the title of an issue, shortened if it is long. */
export function issueTitle(text: string): string {
    const firstLine = text.trim().split("\n")[0].trim();
    return firstLine.length > TITLE_MAX_LENGTH
        ? `${firstLine.slice(0, TITLE_MAX_LENGTH - 1).trimEnd()}…`
        : firstLine;
}

/**
 * When the feedback came in, like "08.10.2026, 07:45"; empty if that is not known.
 * @param timeZone only for tests, otherwise the one of the browser
 */
export function feedbackDate(createdAt: string | null, timeZone?: string): string {
    const date = createdAt ? new Date(createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("de-DE", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone,
    });
}

/** The address of the page the feedback was sent from; the site uses # addresses. */
export function feedbackPageUrl(page: string): string | null {
    return page.startsWith("/") ? `${SITE_URL}/#${page}` : null;
}

/**
 * GitHub's form for a new issue, filled in with the feedback. Name and e-mail are left out on
 * purpose, because the issues of the repository are public.
 */
export function githubIssueUrl(feedback: Pick<FeedbackDTO, "text" | "page" | "createdAt">, timeZone?: string): string {
    const lines = [feedback.text.trim(), "", "---", `Seite: ${feedbackPageUrl(feedback.page) ?? "unbekannt"}`];
    const date = feedbackDate(feedback.createdAt, timeZone);
    if (date) lines.push(`Feedback vom ${date}`);
    const params = new URLSearchParams({ title: issueTitle(feedback.text), body: lines.join("\n") });
    return `${NEW_GITHUB_ISSUE}?${params}`;
}
