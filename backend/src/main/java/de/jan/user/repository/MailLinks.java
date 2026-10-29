package de.jan.user.repository;

import de.jan.exceptions.EntityStateException;
import de.jan.user.MailLinkToken;
import de.jan.user.MailLinkTokenDAO;
import de.jan.user.User;

import java.time.Duration;
import java.util.Date;
import java.util.List;

class MailLinks<T extends MailLinkToken> {

    interface TokenFactory<T> {
        T create(String tokenHash, Long userId, Date expiresAt);
    }

    private final MailLinkTokenDAO<T> tokenDAO;
    private final TokenFactory<T> factory;
    private final Duration validity;
    private final String invalidLink;
    private final UserRepository userRepository;

    MailLinks(MailLinkTokenDAO<T> tokenDAO, TokenFactory<T> factory, Duration validity, String invalidLink,
              UserRepository userRepository) {
        this.tokenDAO = tokenDAO;
        this.factory = factory;
        this.validity = validity;
        this.invalidLink = invalidLink;
        this.userRepository = userRepository;
    }

    /**
     * Issues a new link for the user
     */
    String issue(User user) {
        tokenDAO.deleteByUserId(user.getId());
        OneTimeToken token = new OneTimeToken();
        Date expiresAt = new Date(System.currentTimeMillis() + validity.toMillis());
        tokenDAO.save(factory.create(token.hash(), user.getId(), expiresAt));
        return token.token();
    }

    /**
     * The user of a valid link.
     * The link stays valid until deleteOf, so a failed action doesn't use it up.
     */
    User redeem(String token) {
        if (token == null || token.isBlank()) {
            throw new EntityStateException(invalidLink);
        }
        List<T> matches = tokenDAO.getByTokenHash(new OneTimeToken(token).hash());
        if (matches.isEmpty()) {
            throw new EntityStateException(invalidLink);
        }
        T found = matches.getFirst();
        User user = userRepository.getById(found.getUserId());
        if (found.isExpired() || user == null) {
            tokenDAO.delete(found);
            throw new EntityStateException(invalidLink);
        }
        return user;
    }

    void deleteOf(User user) {
        tokenDAO.deleteByUserId(user.getId());
    }
}
