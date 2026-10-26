package de.jan.controller.response;

import java.util.List;

/**
 * The visits of the last days, for the admin area "Statistik".
 *
 * @param days  every day of the period, the oldest first, also the ones without visits
 * @param pages the most opened pages of the period, the most opened first
 */
public record StatsResponse(List<Day> days, List<Page> pages) {

    /** @param day like "2026-10-26" */
    public record Day(String day, int visits, int pageViews) {
    }

    public record Page(String page, int views) {
    }
}
