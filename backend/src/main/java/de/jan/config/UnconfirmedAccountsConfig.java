package de.jan.config;

import com.googlecode.objectify.ObjectifyService;
import de.jan.user.repository.EmailConfirmationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.context.annotation.Configuration;

/**
 * On startup, before the web server accepts requests, deletes the accounts whose email address
 * wasn't confirmed in time, see EmailConfirmationRepository.
 */
@Configuration
public class UnconfirmedAccountsConfig implements SmartInitializingSingleton {

    private static final Logger log = LoggerFactory.getLogger(UnconfirmedAccountsConfig.class);

    private final EmailConfirmationRepository emailConfirmationRepository;

    public UnconfirmedAccountsConfig(EmailConfirmationRepository emailConfirmationRepository) {
        this.emailConfirmationRepository = emailConfirmationRepository;
    }

    @Override
    public void afterSingletonsInstantiated() {
        ObjectifyService.run(() -> {
            try {
                int deleted = emailConfirmationRepository.deleteExpiredAccounts();
                if (deleted > 0) {
                    log.info("Bootstrap: deleted {} accounts that were never confirmed.", deleted);
                }
            } catch (Exception e) {
                log.error("Bootstrap: cleanup of unconfirmed accounts failed: {}", e.getMessage());
            }
            return null;
        });
    }
}
