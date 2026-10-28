package de.jan.stats;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import de.jan.objectify.DatastoreEntity;

import java.util.HashMap;
import java.util.Map;

/** The visits of one day (in German time), with the day like "2026-10-26" as its id. Only counters, nothing about the visitors. */
@Entity
public class VisitDay implements DatastoreEntity {

    @Id
    private String day;

    /** visits started that day: a browser opening the website, counted once per tab */
    private int visits;

    /** page like "/cookbook/12" → how often it was opened that day */
    private final Map<String, Integer> pageViews = new HashMap<>();

    @SuppressWarnings("unused")
    public VisitDay() {
    }

    public VisitDay(String day) {
        this.day = day;
    }

    public String getDay() { return day; }

    public int getVisits() { return visits; }
    public void setVisits(int visits) { this.visits = visits; }

    public Map<String, Integer> getPageViews() { return pageViews; }
}
