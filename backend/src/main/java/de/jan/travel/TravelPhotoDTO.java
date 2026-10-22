package de.jan.travel;

/**
 * A photo of a travel folder as the frontend gets it; the image itself is loaded by the id.
 *
 * @param caption empty if the photo has none
 */
public record TravelPhotoDTO(Long id, String caption) {

    public static TravelPhotoDTO from(TravelPhoto photo) {
        return new TravelPhotoDTO(photo.getId(), photo.getCaption());
    }
}
