package de.jan.role;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import de.jan.objectify.DatastoreEntity;

import java.util.ArrayList;
import java.util.List;

/**
 * A named set of permissions, assigned to users via User.roleIds.
 * The system role ADMIN always has every permission and can't be changed or deleted.
 */
@Entity
public class Role implements DatastoreEntity {

    public static final String ADMIN = "ADMIN";

    @Id
    private Long id;

    @Index
    private String name;

    private List<Permission> permissions = new ArrayList<>();

    private boolean system;

    public Role() {

    }

    public Role(String name, List<Permission> permissions, boolean system) {
        this.name = name;
        this.permissions = permissions;
        this.system = system;
    }

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // Objectify does not store empty lists, so they load as null
    public List<Permission> getPermissions() {
        if (permissions == null) permissions = new ArrayList<>();
        return permissions;
    }
    public void setPermissions(List<Permission> permissions) { this.permissions = permissions; }

    public boolean isSystem() { return system; }
}
