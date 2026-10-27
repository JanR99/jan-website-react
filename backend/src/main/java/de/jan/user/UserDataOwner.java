package de.jan.user;

/**
 * Something that keeps data of a user, e.g. the statistics of a game. When an account is deleted,
 * UserRepository asks every one of them (all Spring beans with this interface) to delete that user's data,
 * so a new kind of data only has to implement this to go with the account.
 */
public interface UserDataOwner {

    void deleteDataOf(User user);
}
