package de.jan.travel;

import java.util.List;

public class TravelFolderDTO {

    private Long id;
    private String name;
    private String country;
    private Long coverPhotoId;
    private Double latitude;
    private Double longitude;
    private List<Long> photoIds;

    /** @param photoIds the photos of the folder in the order they are shown */
    public static TravelFolderDTO from(TravelFolder folder, List<Long> photoIds) {
        TravelFolderDTO dto = new TravelFolderDTO();
        dto.id = folder.getId();
        dto.name = folder.getName();
        dto.country = folder.getCountry();
        dto.latitude = folder.getLatitude();
        dto.longitude = folder.getLongitude();
        dto.photoIds = List.copyOf(photoIds);
        // the chosen cover, otherwise the first photo
        Long cover = folder.getCoverPhotoId();
        dto.coverPhotoId = cover != null && dto.photoIds.contains(cover)
                ? cover
                : dto.photoIds.stream().findFirst().orElse(null);
        return dto;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCountry() { return country; }
    /** null if the folder has no photos yet */
    public Long getCoverPhotoId() { return coverPhotoId; }
    /** null if the folder has no place on the map; then the longitude is null as well */
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public List<Long> getPhotoIds() { return photoIds; }
}
