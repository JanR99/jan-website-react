package de.jan.controller.requests;

import java.util.Set;

public class SetRolesRequest {

    private String email;
    private Set<Long> roleIds;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Set<Long> getRoleIds() { return roleIds; }
    public void setRoleIds(Set<Long> roleIds) { this.roleIds = roleIds; }
}
