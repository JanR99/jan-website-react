package de.jan.user;

import de.jan.objectify.BaseDAO;
import de.jan.objectify.Filter;

import java.util.List;

public class PasswordResetTokenDAO extends BaseDAO<PasswordResetToken, Long> {

    public PasswordResetTokenDAO() {
        super(PasswordResetToken.class);
    }

    public List<PasswordResetToken> getByTokenHash(String tokenHash) {
        return find(Filter.eq("tokenHash", tokenHash));
    }

    public List<PasswordResetToken> getByUserId(Long userId) {
        return find(Filter.eq("userId", userId));
    }
}
