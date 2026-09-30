package de.jan.user;

import java.util.Set;

/** A user as seen in the user management, including their roles (not sent on login). */
public class UserAdminDTO {

    private Long id;
    private String email;
    private String firstname;
    private String lastname;
    private Set<Long> roleIds;

    public static UserAdminDTO from(User user) {
        UserAdminDTO dto = new UserAdminDTO();
        dto.id = user.getId();
        dto.email = user.getEmail();
        dto.firstname = user.getFirstname();
        dto.lastname = user.getLastname();
        dto.roleIds = Set.copyOf(user.getRoleIds());
        return dto;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstname() { return firstname; }
    public String getLastname() { return lastname; }
    public Set<Long> getRoleIds() { return roleIds; }
}
