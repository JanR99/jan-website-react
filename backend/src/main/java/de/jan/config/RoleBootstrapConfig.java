package de.jan.config;

import com.googlecode.objectify.ObjectifyService;
import de.jan.role.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.context.annotation.Configuration;

/**
 * On startup, before the web server accepts requests, makes sure the system role ADMIN
 * exists and has every permission.
 */
@Configuration
public class RoleBootstrapConfig implements SmartInitializingSingleton {

    private static final Logger log = LoggerFactory.getLogger(RoleBootstrapConfig.class);

    private final RoleRepository roleRepository;

    public RoleBootstrapConfig(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void afterSingletonsInstantiated() {
        ObjectifyService.run(() -> {
            try {
                roleRepository.ensureAdminRole();
            } catch (Exception e) {
                log.error("Bootstrap: role setup failed: {}", e.getMessage());
            }
            return null;
        });
    }
}
