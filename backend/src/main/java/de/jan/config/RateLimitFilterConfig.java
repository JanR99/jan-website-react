package de.jan.config;

import de.jan.security.LoginRateLimitFilter;
import de.jan.security.RateLimiter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RateLimitFilterConfig {

    @Bean
    public FilterRegistrationBean<LoginRateLimitFilter> loginRateLimitFilter(RateLimiter rateLimiter) {
        FilterRegistrationBean<LoginRateLimitFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new LoginRateLimitFilter(rateLimiter));
        registrationBean.addUrlPatterns(LoginRateLimitFilter.limitedPaths());
        registrationBean.setOrder(0); // after CORS, before Objectify (order 1) and JWT (order 2)
        return registrationBean;
    }
}