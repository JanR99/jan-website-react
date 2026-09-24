package de.jan.config;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatastoreConfig {

    @Bean
    public Datastore datastore() {
        // Assumes GOOGLE_APPLICATION_CREDENTIALS env var is set
        return DatastoreOptions.newBuilder().build().getService();
    }
}