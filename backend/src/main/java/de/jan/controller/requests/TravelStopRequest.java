package de.jan.controller.requests;

/** @param name like "Sevilla"; may be empty */
public record TravelStopRequest(String name, Double latitude, Double longitude) {
}
