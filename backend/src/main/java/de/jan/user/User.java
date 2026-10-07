package de.jan.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.googlecode.objectify.annotation.AlsoLoad;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.IgnoreSave;
import com.googlecode.objectify.annotation.Index;
import de.jan.objectify.DatastoreEntity;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
public class User implements DatastoreEntity {

    @Id
    private Long id;

    @Index
    private String email;

    @JsonIgnore
    private String hashedPassword;

    private String firstname;

    private String lastname;

    @Index
    private Set<Long> roleIds = new LinkedHashSet<>();

    @Index
    private List<Long> favoriteRecipeIds = new ArrayList<>();

    /**
     * Counts the password changes. A token carries the number it was issued with,
     * so every login from before a password change stops working.
     */
    private int tokenVersion;

    /**
     * Favorites from before the recipes moved into the database, stored as recipe titles.
     * Only loaded (never saved) so RecipeBootstrapConfig can migrate them to IDs; the next save drops them.
     */
    @AlsoLoad("favorites")
    @IgnoreSave
    private List<String> legacyFavoriteTitles;

    public User() {

    }

    public User(String email, String password, String firstname, String lastname) {
        this();
        this.email = email;
        this.hashedPassword = password;
        this.firstname = firstname;
        this.lastname = lastname;
    }

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getHashedPassword() {
        return hashedPassword;
    }

    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public Set<Long> getRoleIds() {
        // Objectify does not store empty collections, so they load as null
        if (roleIds == null) {
            roleIds = new LinkedHashSet<>();
        }
        return roleIds;
    }

    public void setRoleIds(Set<Long> roleIds) {
        this.roleIds = roleIds;
    }

    public List<Long> getFavoriteRecipeIds() {
        // Objectify does not store empty lists, so older/empty entities load with null
        if (favoriteRecipeIds == null) {
            favoriteRecipeIds = new ArrayList<>();
        }
        return favoriteRecipeIds;
    }

    public void setFavoriteRecipeIds(List<Long> favoriteRecipeIds) {
        this.favoriteRecipeIds = favoriteRecipeIds;
    }

    public int getTokenVersion() {
        return tokenVersion;
    }

    public void setTokenVersion(int tokenVersion) {
        this.tokenVersion = tokenVersion;
    }

    public List<String> getLegacyFavoriteTitles() {
        return legacyFavoriteTitles;
    }

    public void clearLegacyFavoriteTitles() {
        this.legacyFavoriteTitles = null;
    }
}
