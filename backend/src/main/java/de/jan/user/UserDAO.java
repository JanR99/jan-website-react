package de.jan.user;

import de.jan.objectify.BaseDAO;
import de.jan.objectify.Filter;

import java.util.Date;
import java.util.List;

public class UserDAO extends BaseDAO<User, Long> {

    public UserDAO() {
        super(User.class);
    }

    public List<User> getByEmail(String email) {
        return find(Filter.eq("email", email));
    }

    public List<User> getByRoleId(Long roleId) {
        return find(Filter.eq("roleIds", roleId));
    }

    public List<User> getUnconfirmedSince(Date before) {
        return find(Filter.lt("unconfirmedSince", before));
    }

    public List<User> getByFavoriteRecipeId(Long recipeId) {
        return find(Filter.eq("favoriteRecipeIds", recipeId));
    }
}
