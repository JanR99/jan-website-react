package de.jan.controller.requests;

import java.util.List;

public class TravelPhotoOrderRequest {

    private List<Long> photoIds;

    public List<Long> getPhotoIds() { return photoIds; }
    public void setPhotoIds(List<Long> photoIds) { this.photoIds = photoIds; }
}
