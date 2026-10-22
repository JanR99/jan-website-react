package de.jan.user;

public record UserDTO(Long id, String email, String firstname, String lastname) {

    public static UserDTO from(User user) {
        return new UserDTO(user.getId(), user.getEmail(), user.getFirstname(), user.getLastname());
    }
}
