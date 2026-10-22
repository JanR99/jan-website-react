package de.jan.controller.response;

import de.jan.user.UserDTO;

public record LoginResponse(String token, UserDTO user) {
}
