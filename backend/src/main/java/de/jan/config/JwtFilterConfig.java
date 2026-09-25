package de.jan.config;

import de.jan.security.JwtAuthFilter;
import de.jan.security.JwtService;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Set;

@Configuration
public class JwtFilterConfig {

    private final Set<String> safeRoutes = Set.of(
            "/api/users/getUserByEmail"
    );

    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilter(JwtService jwtService) {
        FilterRegistrationBean<JwtAuthFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new JwtAuthFilter(jwtService));

        // only safe routes here
        for (String safeRoute : safeRoutes) {
            registrationBean.addUrlPatterns(safeRoute);
        }

        registrationBean.setOrder(2); // after Objectify-Filter
        return registrationBean;
    }
}