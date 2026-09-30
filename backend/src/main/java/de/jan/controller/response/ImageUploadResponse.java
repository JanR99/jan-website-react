package de.jan.controller.response;

public class ImageUploadResponse {

    /** value for RecipeRequest.image ("uploads/<id>") */
    private final String image;

    public ImageUploadResponse(String image) {
        this.image = image;
    }

    public String getImage() { return image; }
}
