package de.jan.user;

import de.jan.objectify.BaseDAO;
import de.jan.objectify.Filter;

import java.util.List;

public class MailLinkTokenDAO<T extends MailLinkToken> extends BaseDAO<T, Long> {

    public MailLinkTokenDAO(Class<T> clazz) {
        super(clazz);
    }

    public List<T> getByTokenHash(String tokenHash) {
        return find(Filter.eq("tokenHash", tokenHash));
    }

    public List<T> getByUserId(Long userId) {
        return find(Filter.eq("userId", userId));
    }

    public void deleteByUserId(Long userId) {
        List<T> tokens = getByUserId(userId);
        if (!tokens.isEmpty()) {
            deleteAll(tokens);
        }
    }
}
