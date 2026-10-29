package de.jan.stats.repository;

import de.jan.controller.requests.VisitRequest;
import de.jan.controller.response.StatsResponse;
import de.jan.exceptions.EntityStateException;
import de.jan.stats.VisitDay;
import de.jan.stats.VisitDayDAO;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Counts visits and opened pages per day, without anything about the visitors (no IP, no cookie).
 * Admins with VIEW_STATS aren't counted; the frontend leaves them out.
 */
@Component
public class VisitDayRepository {

    /** the days are German days */
    public static final ZoneId ZONE = ZoneId.of("Europe/Berlin");
    /** the period the admin area shows */
    public static final int DAYS = 30;
    /** the admin area lists this many pages */
    public static final int TOP_PAGES = 20;
    /** more different pages than a day has, so a flood of made-up pages can't make the entity too big */
    public static final int MAX_PAGES_PER_DAY = 500;

    /** a path of the website: lower case letters, digits, "-", "_" and "/", like "/cookbook/12" */
    private static final Pattern PAGE = Pattern.compile("/[a-z0-9_/-]{0,99}");

    private final VisitDayDAO visitDayDAO = new VisitDayDAO();

    /** Counts a page that was opened, and with newVisit the visit it starts. */
    public void record(VisitRequest request) {
        String page = request == null ? null : request.page();
        if (page == null || !PAGE.matcher(page).matches()) {
            throw new EntityStateException("The page must be a path of the website like /cookbook/12");
        }
        boolean newVisit = Boolean.TRUE.equals(request.newVisit());
        String today = LocalDate.now(ZONE).toString();
        visitDayDAO.update(today, () -> new VisitDay(today), (day) -> {
            if (newVisit) {
                day.setVisits(day.getVisits() + 1);
            }
            Map<String, Integer> views = day.getPageViews();
            if (views.containsKey(page) || views.size() < MAX_PAGES_PER_DAY) {
                views.merge(page, 1, Integer::sum);
            }
        });
    }

    /** The last DAYS days up to today, and the most opened pages of that time. */
    public StatsResponse get() {
        LocalDate today = LocalDate.now(ZONE);
        List<String> dayIds = today.minusDays(DAYS - 1).datesUntil(today.plusDays(1)).map(LocalDate::toString).toList();
        Map<String, VisitDay> stored = visitDayDAO.getByIds(dayIds).stream()
                .collect(Collectors.toMap(VisitDay::getDay, Function.identity()));

        Map<String, Integer> pageTotals = new HashMap<>();
        List<StatsResponse.Day> days = dayIds.stream().map((id) -> {
            VisitDay day = stored.get(id);
            if (day == null) {
                return new StatsResponse.Day(id, 0, 0);
            }
            day.getPageViews().forEach((page, views) -> pageTotals.merge(page, views, Integer::sum));
            int pageViews = day.getPageViews().values().stream().mapToInt(Integer::intValue).sum();
            return new StatsResponse.Day(id, day.getVisits(), pageViews);
        }).toList();

        List<StatsResponse.Page> pages = pageTotals.entrySet().stream()
                .map((entry) -> new StatsResponse.Page(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparingInt(StatsResponse.Page::views).reversed().thenComparing(StatsResponse.Page::page))
                .limit(TOP_PAGES)
                .toList();
        return new StatsResponse(days, pages);
    }
}
