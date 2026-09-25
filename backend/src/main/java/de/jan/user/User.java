package de.jan.user;

import com.googlecode.objectify.Key;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import de.jan.objectify.DatastoreEntity;

@Entity
public class User implements DatastoreEntity {

    @Id
    private Key<User> key;

    @Index
    private String email;

    private String password;

    private String firstname;

    private String lastname;

    public User() {}

    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public Key<User> getUserKey() {
        return key;
    }

    public void setUserKey(Key<User> key) {
        this.key = key;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}