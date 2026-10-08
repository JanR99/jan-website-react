package de.jan.controller.requests;

public class FeedbackRequest {

    private String text;

    /** the page the user is on, like "/cookbook/Ramen" */
    private String page;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getPage() { return page; }
    public void setPage(String page) { this.page = page; }
}
