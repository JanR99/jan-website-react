package de.jan.config;

import com.google.cloud.NoCredentials;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.googlecode.objectify.ObjectifyFactory;
import com.googlecode.objectify.ObjectifyService;
import de.jan.feedback.Feedback;
import de.jan.games.CrosswordStats;
import de.jan.games.KanaStats;
import de.jan.games.KanjiStats;
import de.jan.image.RecipeImage;
import de.jan.objectify.DatastoreEntity;
import de.jan.recipe.Recipe;
import de.jan.recipe.RecipeSeedMarker;
import de.jan.role.Role;
import de.jan.stats.VisitDay;
import de.jan.travel.*;
import de.jan.user.PasswordResetToken;
import de.jan.user.User;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ObjectifyConfig {

    private final List<Class<? extends DatastoreEntity>> datastoreEntities = List.of(
        User.class,
        PasswordResetToken.class,
        Recipe.class,
        RecipeImage.class,
        RecipeSeedMarker.class,
        Role.class,
        TravelFolder.class,
        TravelPhoto.class,
        TravelPhotoFile.class,
        TravelPhotoPreview.class,
        TravelSeedMarker.class,
        Feedback.class,
        CrosswordStats.class,
        KanjiStats.class,
        KanaStats.class,
        VisitDay.class
    );

    private final CloudRun cloudRun;

    public ObjectifyConfig(CloudRun cloudRun) {
        this.cloudRun = cloudRun;
    }

    @PostConstruct
    public void init() {
        init(cloudRun.isActive(), System.getenv("DATASTORE_EMULATOR_HOST"));
    }

    /**
     * Refuses to start outside Cloud Run unless the Datastore emulator is configured
     * (the emulator setup sets DATASTORE_EMULATOR_HOST).
     */
    void init(boolean onCloudRun, String emulatorHost) {
        boolean usingEmulator = emulatorHost != null;
        if (!onCloudRun && !usingEmulator) {
            throw new IllegalStateException(
                    "Refusing to start: not running on Cloud Run and DATASTORE_EMULATOR_HOST is not set. "
                            + "Start the app via start-dev.ps1 / start-dev.sh so it uses the emulator.");
        }

        // The emulator host is set explicitly: since google-cloud-datastore 3.x the default options
        // ignore DATASTORE_EMULATOR_HOST and would talk to the real Datastore.
        DatastoreOptions options = usingEmulator
                ? DatastoreOptions.newBuilder()
                        .setHost(emulatorHost)
                        .setCredentials(NoCredentials.getInstance())
                        .build()
                : DatastoreOptions.getDefaultInstance();
        Datastore datastore = options.getService();
        ObjectifyService.init(new ObjectifyFactory(datastore));
        for (Class<? extends DatastoreEntity> objectifyEntityClass : datastoreEntities) {
            ObjectifyService.register(objectifyEntityClass);
        }
    }
}