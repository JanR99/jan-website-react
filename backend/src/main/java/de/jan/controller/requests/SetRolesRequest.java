package de.jan.controller.requests;

import java.util.Set;

public record SetRolesRequest(String email, Set<Long> roleIds) {
}
