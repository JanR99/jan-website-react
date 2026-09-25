package de.jan.user;

public class UserDTO {

    private Long id;
    private String email;
    private String firstname;
    private String lastname;

    public static UserDTO from(User user) {
        UserDTO dto = new UserDTO();
        dto.id = user.getId();
        dto.email = user.getEmail();
        dto.firstname = user.getFirstname();
        dto.lastname = user.getLastname();
        return dto;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstname() { return firstname; }
    public String getLastname() { return lastname; }
}
