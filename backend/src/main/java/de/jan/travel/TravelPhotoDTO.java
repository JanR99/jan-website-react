package de.jan.travel;

/** A photo of a travel folder as the frontend gets it; the image itself is loaded by the id. */
public class TravelPhotoDTO {

    private Long id;
    private String caption;

    public static TravelPhotoDTO from(TravelPhoto photo) {
        TravelPhotoDTO dto = new TravelPhotoDTO();
        dto.id = photo.getId();
        dto.caption = photo.getCaption();
        return dto;
    }

    public Long getId() { return id; }
    /** empty if the photo has none */
    public String getCaption() { return caption; }
}
