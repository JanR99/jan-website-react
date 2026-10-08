/** Feedback a logged-in user sent about the website. */
export interface FeedbackDTO {
    id: number;
    userName: string;
    userEmail: string;
    /** paragraphs separated by line breaks */
    text: string;
    /** the page the user was on, like "/cookbook/Ramen"; empty if not known */
    page: string;
    /** ISO date and time like "2026-10-08T05:45:00Z" */
    createdAt: string | null;
    done: boolean;
}

export interface FeedbackRequest {
    text: string;
    page: string;
}
