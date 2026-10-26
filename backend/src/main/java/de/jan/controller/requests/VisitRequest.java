package de.jan.controller.requests;

/**
 * A page opened in the browser.
 *
 * @param page     the page like "/cookbook/12"
 * @param newVisit true for the first page of a visit, so the visit is counted as well
 */
public record VisitRequest(String page, Boolean newVisit) {
}
