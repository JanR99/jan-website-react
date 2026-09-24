package de.jan.config;

import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.ObjectifyService;
import de.jan.objectify.DatastoreEntity;
import de.jan.user.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ObjectifyConfig {

    List<Class<? extends DatastoreEntity>> datastoreEntities = List.of(
        User.class
    );

    @Bean
    public Objectify ofy() {
        for (Class<? extends DatastoreEntity> objectifyEntityClass : datastoreEntities) {
            ObjectifyService.register(objectifyEntityClass);
        }
        return ObjectifyService.ofy();
    }
}