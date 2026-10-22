package de.jan.controller.requests;

/** @param page the page the user is on, like "/cookbook/Ramen" */
public record FeedbackRequest(String text, String page) {
}
