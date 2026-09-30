package de.jan.role;

import de.jan.objectify.BaseDAO;
import de.jan.objectify.Filter;

import java.util.List;

public class RoleDAO extends BaseDAO<Role, Long> {

    public RoleDAO() {
        super(Role.class);
    }

    public List<Role> getByName(String name) {
        return find(Filter.eq("name", name));
    }
}
