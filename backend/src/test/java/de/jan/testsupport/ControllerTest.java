package de.jan.testsupport;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.QueryResults;
import com.googlecode.objectify.ObjectifyService;
import de.jan.controller.requests.RegisterRequest;
import de.jan.controller.requests.RoleRequest;
import de.jan.recipe.repository.RecipeRepository;
import de.jan.role.Permission;
import de.jan.role.Role;
import de.jan.role.repository.RoleRepository;
import de.jan.security.JwtService;
import de.jan.security.RateLimiter;
import de.jan.travel.repository.TravelRepository;
import de.jan.user.User;
import de.jan.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

/**
 * Base class for controller tests: the whole application runs against a Datastore emulator that is
 * started for the test run, and is called through MockMvc, so a test sees the same status codes and
 * JSON as the frontend. Every test starts with an empty database.
 */
@ExtendWith(DatastoreEmulatorExtension.class)
@SpringBootTest
@AutoConfigureMockMvc
public abstract class ControllerTest {

    protected static final String NOT_LOGGED_IN = "You need to be logged in to use this method";

    private static final AtomicInteger COUNTER = new AtomicInteger();

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected JwtService jwtService;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected RoleRepository roleRepository;

    @Autowired
    private RecipeRepository recipeRepositoryForCacheReset;

    @Autowired
    private TravelRepository travelRepositoryForCacheReset;

    @Autowired
    private RateLimiter rateLimiter;

    @BeforeEach
    void startWithEmptyDatabase() {
        Datastore datastore = ObjectifyService.factory().datastore();
        // a query without a kind returns the keys of all entities
        QueryResults<Key> keys = datastore.run(Query.newKeyQueryBuilder().build());
        List<Key> toDelete = new ArrayList<>();
        while (keys.hasNext()) {
            Key key = keys.next();
            if (!key.getKind().startsWith("__")) {
                toDelete.add(key);
            }
        }
        if (!toDelete.isEmpty()) {
            datastore.delete(toDelete.toArray(new Key[0]));
        }
        // the recipe list is cached for a minute, which would leak recipes into the next test
        ReflectionTestUtils.setField(recipeRepositoryForCacheReset, "cache", null);
        // same for the travel folders
        ReflectionTestUtils.setField(travelRepositoryForCacheReset, "cache", null);
        // login, password reset, password change and registration are rate limited, counted across all tests otherwise
        ((Map<?, ?>) Objects.requireNonNull(ReflectionTestUtils.getField(rateLimiter, "windows"))).clear();
    }

    /** Runs code that uses the database directly, like the ObjectifyFilter does for a request. */
    protected <T> T inDatastore(Supplier<T> work) {
        return ObjectifyService.run(work::get);
    }

    /** Registers a new user who has exactly these permissions (through a role of their own). */
    protected User userWith(Permission... permissions) {
        return inDatastore(() -> {
            int number = COUNTER.incrementAndGet();
            RegisterRequest register = new RegisterRequest();
            register.setEmail("user" + number + "@example.com");
            register.setPassword("password-" + number);
            register.setFirstname("User");
            register.setLastname("Number " + number);
            User user = userRepository.register(register);

            if (permissions.length > 0) {
                RoleRequest roleRequest = new RoleRequest();
                roleRequest.setName("role-" + number);
                roleRequest.setPermissions(List.of(permissions));
                Role role = roleRepository.create(roleRequest);
                user.getRoleIds().add(role.getId());
                userRepository.save(user);
            }
            return user;
        });
    }

    protected Role storedRole(String name, Permission... permissions) {
        RoleRequest request = new RoleRequest();
        request.setName(name);
        request.setPermissions(List.of(permissions));
        return inDatastore(() -> roleRepository.create(request));
    }

    /** Registers a new user with the system role ADMIN. */
    protected User adminUser() {
        User user = userWith();
        return inDatastore(() -> {
            User stored = userRepository.getByEmail(user.getEmail());
            userRepository.grantAdminRole(stored);
            return stored;
        });
    }

    /** Value for the Authorization header of a logged-in user. */
    protected String bearer(User user) {
        return "Bearer " + jwtService.generateToken(user, false);
    }

    /** Authorization header of a new user with exactly these permissions. */
    protected String bearerWith(Permission... permissions) {
        return bearer(userWith(permissions));
    }

    protected String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }
}
