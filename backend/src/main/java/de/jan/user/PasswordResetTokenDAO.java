package de.jan.user;

import de.jan.objectify.BaseDAO;

import java.util.List;
import java.util.Map;

public class PasswordResetTokenDAO extends BaseDAO<PasswordResetToken> {

    public PasswordResetTokenDAO() {
        super(PasswordResetToken.class);
    }

    public List<PasswordResetToken> getByTokenHash(String tokenHash) {
        return super.findByFilter(Map.of("tokenHash", tokenHash));
    }

    public List<PasswordResetToken> getByUserId(Long userId) {
        return super.findByFilter(Map.of("userId", userId));
    }
}
