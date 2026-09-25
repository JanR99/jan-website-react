package de.jan.config;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.googlecode.objectify.ObjectifyFactory;
import com.googlecode.objectify.ObjectifyService;
import de.jan.objectify.DatastoreEntity;
import de.jan.user.User;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ObjectifyConfig {

    List<Class<? extends DatastoreEntity>> datastoreEntities = List.of(
        User.class
    );

    @PostConstruct
    public void init() {
        Datastore datastore = DatastoreOptions.getDefaultInstance().getService();
        ObjectifyService.init(new ObjectifyFactory(datastore));
        for (Class<? extends DatastoreEntity> objectifyEntityClass : datastoreEntities) {
            ObjectifyService.register(objectifyEntityClass);
        }
    }
}