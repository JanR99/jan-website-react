package de.jan.controller.requests;

import java.util.List;

public record TravelPhotoOrderRequest(List<Long> photoIds) {
}
