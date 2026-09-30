package de.jan.config;

import com.googlecode.objectify.ObjectifyService;
import de.jan.role.repository.RoleRepository;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.context.annotation.Configuration;

/**
 * On startup, before the web server accepts requests, makes sure the system role ADMIN
 * exists and has every permission.
 */
@Configuration
public class RoleBootstrapConfig implements SmartInitializingSingleton {

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
                System.out.println("Bootstrap: role setup failed: " + e.getMessage());
            }
            return null;
        });
    }
}
