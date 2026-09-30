package de.jan.config;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.googlecode.objectify.ObjectifyFactory;
import com.googlecode.objectify.ObjectifyService;
import de.jan.image.RecipeImage;
import de.jan.objectify.DatastoreEntity;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeSeedMarker;
import de.jan.role.Role;
import de.jan.user.PasswordResetToken;
import de.jan.user.User;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ObjectifyConfig {

    List<Class<? extends DatastoreEntity>> datastoreEntities = List.of(
        User.class,
        PasswordResetToken.class,
        Recipe.class,
        RecipeImage.class,
        RecipeSeedMarker.class,
        Role.class
    );

    @PostConstruct
    public void init() {
        // Refuse to start outside Cloud Run unless the Datastore emulator is configured.
        // Cloud Run always sets K_SERVICE; the emulator setup sets DATASTORE_EMULATOR_HOST.
        boolean onCloudRun = System.getenv("K_SERVICE") != null;
        boolean usingEmulator = System.getenv("DATASTORE_EMULATOR_HOST") != null;
        if (!onCloudRun && !usingEmulator) {
            throw new IllegalStateException(
                    "Refusing to start: not running on Cloud Run and DATASTORE_EMULATOR_HOST is not set. "
                            + "Start the app via start-dev.ps1 / start-dev.sh so it uses the emulator.");
        }

        Datastore datastore = DatastoreOptions.getDefaultInstance().getService();
        ObjectifyService.init(new ObjectifyFactory(datastore));
        for (Class<? extends DatastoreEntity> objectifyEntityClass : datastoreEntities) {
            ObjectifyService.register(objectifyEntityClass);
        }
    }
}