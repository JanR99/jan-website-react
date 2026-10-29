package de.jan.user;

import de.jan.objectify.BaseDAO;
import de.jan.objectify.Filter;

import java.util.List;

public class EmailConfirmationTokenDAO extends BaseDAO<EmailConfirmationToken, Long> {

    public EmailConfirmationTokenDAO() {
        super(EmailConfirmationToken.class);
    }

    public List<EmailConfirmationToken> getByTokenHash(String tokenHash) {
        return find(Filter.eq("tokenHash", tokenHash));
    }

    public List<EmailConfirmationToken> getByUserId(Long userId) {
        return find(Filter.eq("userId", userId));
    }
}
