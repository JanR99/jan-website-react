package de.jan.config;

import com.googlecode.objectify.ObjectifyService;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ObjectifyFilterConfig {

    @Bean
    FilterRegistrationBean<ObjectifyService.Filter> objectifyFilter() {
		FilterRegistrationBean<ObjectifyService.Filter> objectifyFilterRegistrationBean = new FilterRegistrationBean<>();
		objectifyFilterRegistrationBean.addUrlPatterns("/*");
		objectifyFilterRegistrationBean.setFilter(new ObjectifyService.Filter());
		return objectifyFilterRegistrationBean;
	}
}