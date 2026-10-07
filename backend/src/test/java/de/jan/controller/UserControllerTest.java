package de.jan.controller;

import de.jan.controller.requests.RegisterRequest;
import de.jan.role.Permission;
import de.jan.role.Role;
import de.jan.testsupport.ControllerTest;
import de.jan.user.PasswordResetToken;
import de.jan.user.PasswordResetTokenDAO;
import de.jan.user.User;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserControllerTest extends ControllerTest {

    private static final String EMAIL = "anna@example.com";
    private static final String PASSWORD = "correct-password";

    private static final String MISSING_PERMISSION = "Missing permission MANAGE_USERS";
    private static final String INVALID_CREDENTIALS = "Invalid credentials";
    private static final String INVALID_LINK = "This reset link is invalid or has expired";
    private static final String PASSWORD_TOO_SHORT = "Invalid password: passwords need to be at least 8 characters long";
    private static final String LOCKOUT = "You cannot take away your own permission to manage users";

    @Nested
    class Register {

        @Test
        void returnsTheNewUserWithoutPasswordAndRoles() throws Exception {
            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(registerBody("Anna@Example.com", PASSWORD)))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id").isNumber())
                    // the email is stored in lower case
                    .andExpect(jsonPath("$.email").value(EMAIL))
                    .andExpect(jsonPath("$.firstname").value("Anna"))
                    .andExpect(jsonPath("$.lastname").value("Test"))
                    .andExpect(jsonPath("$.password").doesNotExist())
                    .andExpect(jsonPath("$.hashedPassword").doesNotExist())
                    .andExpect(jsonPath("$.roleIds").doesNotExist());
        }

        @Test
        void withInvalidEmail_returns400() throws Exception {
            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(registerBody("not-an-email", PASSWORD)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Invalid email address format"));
        }

        @Test
        void withoutEmail_returns400() throws Exception {
            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(Map.of("password", PASSWORD))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Invalid email address format"));
        }

        @Test
        void withTooShortPassword_returns400() throws Exception {
            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(registerBody(EMAIL, "short")))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(PASSWORD_TOO_SHORT));
        }

        @Test
        void withEmailThatIsTaken_returns400() throws Exception {
            registered(EMAIL);

            mockMvc.perform(post("/api/users/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(registerBody("ANNA@example.com", "another-password")))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("User with this email already exists"));
        }

        @Test
        void afterThreeRegistrationsInAnHour_returns429() throws Exception {
            for (int number = 1; number <= 3; number++) {
                register("user" + number + "@example.com", PASSWORD).andExpect(status().isOk());
            }

            register("user4@example.com", PASSWORD)
                    .andExpect(status().isTooManyRequests())
                    .andExpect(jsonPath("$.message").value("Too many registrations, please try again later."));

            // logging in is counted separately
            login("user1@example.com", PASSWORD).andExpect(status().isOk());
        }

        @Test
        void rejectedAttempts_doNotCountTowardsTheLimit() throws Exception {
            for (int attempt = 1; attempt <= 5; attempt++) {
                register(EMAIL, "short").andExpect(status().isBadRequest());
            }

            for (int number = 1; number <= 3; number++) {
                register("user" + number + "@example.com", PASSWORD).andExpect(status().isOk());
            }
            register("user4@example.com", PASSWORD).andExpect(status().isTooManyRequests());
        }
    }

    @Nested
    class Login {

        @Test
        void returnsATokenAndTheUser() throws Exception {
            User user = registered(EMAIL);

            MvcResult result = login("Anna@Example.com", PASSWORD)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").isString())
                    .andExpect(jsonPath("$.user.id").value(user.getId()))
                    .andExpect(jsonPath("$.user.email").value(EMAIL))
                    .andExpect(jsonPath("$.user.firstname").value("Anna"))
                    .andExpect(jsonPath("$.user.lastname").value("Test"))
                    .andExpect(jsonPath("$.user.hashedPassword").doesNotExist())
                    .andReturn();

            // the token logs the user in
            String token = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
            mockMvc.perform(get("/api/users/permissions").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                    .andExpect(status().isOk());
        }

        @Test
        void withWrongPassword_returns400() throws Exception {
            registered(EMAIL);

            login(EMAIL, "wrong-password")
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(INVALID_CREDENTIALS));
        }

        @Test
        void withUnknownEmail_returns400WithTheSameMessage() throws Exception {
            login("nobody@example.com", PASSWORD)
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(INVALID_CREDENTIALS));
        }

        @Test
        void withoutPassword_returns400() throws Exception {
            mockMvc.perform(post("/api/users/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(Map.of("email", EMAIL))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Email or password is null"));
        }

        @Test
        void afterFiveAttemptsInAMinute_returns429() throws Exception {
            registered(EMAIL);
            for (int attempt = 1; attempt <= 5; attempt++) {
                login(EMAIL, "wrong-password").andExpect(status().isBadRequest());
            }

            // even the right password is rejected now
            login(EMAIL, PASSWORD)
                    .andExpect(status().isTooManyRequests())
                    .andExpect(jsonPath("$.message").value("Too many attempts, please try again in a minute."));
        }

        @Test
        void withMadeUpForwardedForEntries_theLimitStillApplies() throws Exception {
            registered(EMAIL);
            for (int attempt = 1; attempt <= 5; attempt++) {
                // only the last entry is added by Cloud Run, a client can put anything in front of it
                loginFrom("10.0.0." + attempt + ", 203.0.113.7", "wrong-password")
                        .andExpect(status().isBadRequest());
            }

            loginFrom("10.0.0.6, 203.0.113.7", PASSWORD).andExpect(status().isTooManyRequests());
        }

        @Test
        void attemptsAreCountedPerClientAddress() throws Exception {
            registered(EMAIL);
            for (int attempt = 1; attempt <= 5; attempt++) {
                loginFrom("203.0.113.7", "wrong-password").andExpect(status().isBadRequest());
            }

            loginFrom("203.0.113.8", PASSWORD).andExpect(status().isOk());
        }
    }

    @Nested
    class RequestPasswordReset {

        @Test
        void withKnownEmail_returns204AndStoresAToken() throws Exception {
            User user = registered(EMAIL);

            requestPasswordReset("Anna@Example.com")
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            assertEquals(1, resetTokensOf(user).size());
        }

        @Test
        void requestedTwice_keepsOnlyTheNewestToken() throws Exception {
            User user = registered(EMAIL);

            requestPasswordReset(EMAIL).andExpect(status().isNoContent());
            String firstHash = resetTokensOf(user).getFirst().getTokenHash();
            requestPasswordReset(EMAIL).andExpect(status().isNoContent());

            List<PasswordResetToken> tokens = resetTokensOf(user);
            assertEquals(1, tokens.size());
            assertNotEquals(firstHash, tokens.getFirst().getTokenHash());
        }

        @Test
        void withUnknownEmail_returns204LikeForAKnownOne() throws Exception {
            requestPasswordReset("nobody@example.com")
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));
        }

        @Test
        void withoutEmail_returns204() throws Exception {
            mockMvc.perform(post("/api/users/requestPasswordReset")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isNoContent());
        }
    }

    @Nested
    class ResetPassword {

        @Test
        void withValidToken_returns204AndChangesThePassword() throws Exception {
            User user = registered(EMAIL);
            storeResetToken(user, "valid-token", minutesFromNow(30));

            resetPassword("valid-token", "new-password")
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            login(EMAIL, "new-password").andExpect(status().isOk());
            login(EMAIL, PASSWORD).andExpect(status().isBadRequest());
        }

        @Test
        void usingTheTokenASecondTime_returns400() throws Exception {
            User user = registered(EMAIL);
            storeResetToken(user, "valid-token", minutesFromNow(30));
            resetPassword("valid-token", "new-password").andExpect(status().isNoContent());

            resetPassword("valid-token", "another-password")
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(INVALID_LINK));
        }

        @Test
        void withUnknownToken_returns400() throws Exception {
            resetPassword("unknown-token", "new-password")
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(INVALID_LINK));
        }

        @Test
        void withExpiredToken_returns400AndKeepsThePassword() throws Exception {
            User user = registered(EMAIL);
            storeResetToken(user, "expired-token", minutesFromNow(-1));

            resetPassword("expired-token", "new-password")
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(INVALID_LINK));

            login(EMAIL, PASSWORD).andExpect(status().isOk());
        }

        @Test
        void withTooShortPassword_returns400AndKeepsTheTokenValid() throws Exception {
            User user = registered(EMAIL);
            storeResetToken(user, "valid-token", minutesFromNow(30));

            resetPassword("valid-token", "short")
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(PASSWORD_TOO_SHORT));

            resetPassword("valid-token", "new-password").andExpect(status().isNoContent());
        }

        @Test
        void withoutToken_returns400() throws Exception {
            mockMvc.perform(post("/api/users/resetPassword")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(Map.of("password", "new-password"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(INVALID_LINK));
        }
    }

    @Nested
    class UpdateProfile {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(post("/api/users/updateProfile")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(nameBody("Anna", "New")))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void returnsTheUserWithTheNewName() throws Exception {
            User user = registered(EMAIL);

            mockMvc.perform(post("/api/users/updateProfile")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(nameBody("  Annabell ", " New ")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(user.getId()))
                    .andExpect(jsonPath("$.email").value(EMAIL))
                    // surrounding spaces are removed
                    .andExpect(jsonPath("$.firstname").value("Annabell"))
                    .andExpect(jsonPath("$.lastname").value("New"));

            login(EMAIL, PASSWORD).andExpect(jsonPath("$.user.firstname").value("Annabell"));
        }

        @Test
        void withEmptyFirstname_returns400() throws Exception {
            mockMvc.perform(post("/api/users/updateProfile")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(nameBody(" ", "New")))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("First name must not be empty"));
        }

        @Test
        void withoutLastname_returns400() throws Exception {
            mockMvc.perform(post("/api/users/updateProfile")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(Map.of("firstname", "Anna"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Last name must not be empty"));
        }

        @Test
        void withTooLongName_returns400() throws Exception {
            mockMvc.perform(post("/api/users/updateProfile")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(nameBody("x".repeat(101), "New")))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("First name must be at most 100 characters long"));
        }
    }

    @Nested
    class DeleteAccount {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(post("/api/users/deleteAccount")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(Map.of("password", PASSWORD))))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withTheRightPassword_returns204AndRemovesTheAccount() throws Exception {
            User user = registered(EMAIL);
            String bearer = bearer(user);

            mockMvc.perform(post("/api/users/deleteAccount")
                            .header(HttpHeaders.AUTHORIZATION, bearer)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(Map.of("password", PASSWORD))))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            // the old token is worthless and logging in is no longer possible
            mockMvc.perform(get("/api/users/permissions").header(HttpHeaders.AUTHORIZATION, bearer))
                    .andExpect(status().isUnauthorized());
            login(EMAIL, PASSWORD)
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(INVALID_CREDENTIALS));
        }

        @Test
        void withWrongPassword_returns400AndKeepsTheAccount() throws Exception {
            User user = registered(EMAIL);

            mockMvc.perform(post("/api/users/deleteAccount")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(Map.of("password", "wrong-password"))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Invalid password"));

            login(EMAIL, PASSWORD).andExpect(status().isOk());
        }

        @Test
        void withoutPassword_returns400() throws Exception {
            User user = registered(EMAIL);

            mockMvc.perform(post("/api/users/deleteAccount")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Invalid password"));
        }

        @Test
        void asAdmin_returns400AndKeepsTheAccount() throws Exception {
            User user = registered(EMAIL);
            inDatastore(() -> {
                userRepository.grantAdminRole(userRepository.getByEmail(EMAIL));
                return null;
            });

            mockMvc.perform(post("/api/users/deleteAccount")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(Map.of("password", PASSWORD))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Admin accounts cannot be deleted"));

            login(EMAIL, PASSWORD).andExpect(status().isOk());
        }
    }

    @Nested
    class GetPermissions {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/users/permissions"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutRoles_returnsAnEmptyList() throws Exception {
            mockMvc.perform(get("/api/users/permissions")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith()))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void returnsThePermissionsOfAllRolesOfTheUser() throws Exception {
            User user = userWith(Permission.MANAGE_RECIPES);
            Role managers = storedRole("Managers", Permission.MANAGE_USERS);
            giveRoles(user, user.getRoleIds().iterator().next(), managers.getId());

            mockMvc.perform(get("/api/users/permissions")
                            .header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", containsInAnyOrder("MANAGE_RECIPES", "MANAGE_USERS")));
        }

        @Test
        void asAdmin_returnsAllPermissions() throws Exception {
            mockMvc.perform(get("/api/users/permissions")
                            .header(HttpHeaders.AUTHORIZATION, bearer(adminUser())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", containsInAnyOrder("MANAGE_RECIPES", "MANAGE_TRAVEL", "MANAGE_USERS")));
        }
    }

    @Nested
    class GetUserByEmail {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/users/getUserByEmail").param("email", EMAIL))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403() throws Exception {
            registered(EMAIL);

            mockMvc.perform(get("/api/users/getUserByEmail").param("email", EMAIL)
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));
        }

        @Test
        void withPermission_returnsTheUser() throws Exception {
            User user = registered(EMAIL);

            mockMvc.perform(get("/api/users/getUserByEmail").param("email", "Anna@Example.com")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(user.getId()))
                    .andExpect(jsonPath("$.email").value(EMAIL))
                    .andExpect(jsonPath("$.firstname").value("Anna"))
                    .andExpect(jsonPath("$.lastname").value("Test"))
                    .andExpect(jsonPath("$.hashedPassword").doesNotExist());
        }

        @Test
        void withUnknownEmail_returns204() throws Exception {
            mockMvc.perform(get("/api/users/getUserByEmail").param("email", "nobody@example.com")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS)))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));
        }

        @Test
        void withoutEmail_returns400() throws Exception {
            mockMvc.perform(get("/api/users/getUserByEmail")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    class ListUsers {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(get("/api/users/list"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403() throws Exception {
            mockMvc.perform(get("/api/users/list")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES)))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));
        }

        @Test
        void withPermission_returnsAllUsersWithTheirRolesSortedByEmail() throws Exception {
            registered("berta@example.com");
            User anna = registered(EMAIL);
            // registered by the test support as "user<number>@example.com", so sorted last
            User manager = userWith(Permission.MANAGE_USERS);

            mockMvc.perform(get("/api/users/list")
                            .header(HttpHeaders.AUTHORIZATION, bearer(manager)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(3)))
                    .andExpect(jsonPath("$[0].id").value(anna.getId()))
                    .andExpect(jsonPath("$[0].email").value(EMAIL))
                    .andExpect(jsonPath("$[0].firstname").value("Anna"))
                    .andExpect(jsonPath("$[0].lastname").value("Test"))
                    .andExpect(jsonPath("$[0].roleIds", hasSize(0)))
                    .andExpect(jsonPath("$[0].hashedPassword").doesNotExist())
                    .andExpect(jsonPath("$[1].email").value("berta@example.com"))
                    .andExpect(jsonPath("$[2].email").value(manager.getEmail()))
                    .andExpect(jsonPath("$[2].roleIds", hasSize(1)))
                    .andExpect(jsonPath("$[2].roleIds[0]").value(manager.getRoleIds().iterator().next()));
        }
    }

    @Nested
    class SetRoles {

        @Test
        void withoutLogin_returns401() throws Exception {
            mockMvc.perform(post("/api/users/setRoles")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(rolesBody(EMAIL)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(content().string(NOT_LOGGED_IN));
        }

        @Test
        void withoutPermission_returns403AndChangesNothing() throws Exception {
            registered(EMAIL);
            Role cooks = storedRole("Cooks", Permission.MANAGE_RECIPES);

            mockMvc.perform(post("/api/users/setRoles")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_RECIPES))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(rolesBody(EMAIL, cooks.getId())))
                    .andExpect(status().isForbidden())
                    .andExpect(content().string(MISSING_PERMISSION));

            assertEquals(0, inDatastore(() -> userRepository.getByEmail(EMAIL)).getRoleIds().size());
        }

        @Test
        void withPermission_returnsTheUserWithTheNewRoles() throws Exception {
            User user = registered(EMAIL);
            Role cooks = storedRole("Cooks", Permission.MANAGE_RECIPES);

            mockMvc.perform(post("/api/users/setRoles")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(rolesBody("Anna@Example.com", cooks.getId())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(user.getId()))
                    .andExpect(jsonPath("$.email").value(EMAIL))
                    .andExpect(jsonPath("$.roleIds", hasSize(1)))
                    .andExpect(jsonPath("$.roleIds[0]").value(cooks.getId()));

            // the user has the permissions of the role right away
            mockMvc.perform(get("/api/users/permissions").header(HttpHeaders.AUTHORIZATION, bearer(user)))
                    .andExpect(jsonPath("$", containsInAnyOrder("MANAGE_RECIPES")));
        }

        @Test
        void withoutRoles_takesAllRolesFromTheUser() throws Exception {
            User cook = userWith(Permission.MANAGE_RECIPES);

            mockMvc.perform(post("/api/users/setRoles")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(rolesBody(cook.getEmail())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.roleIds", hasSize(0)));

            mockMvc.perform(get("/api/users/permissions").header(HttpHeaders.AUTHORIZATION, bearer(cook)))
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        void withUnknownUser_returns404() throws Exception {
            mockMvc.perform(post("/api/users/setRoles")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(rolesBody("nobody@example.com")))
                    .andExpect(status().isNotFound())
                    .andExpect(content().string("User with email nobody@example.com not found"));
        }

        @Test
        void withUnknownRole_returns400() throws Exception {
            registered(EMAIL);

            mockMvc.perform(post("/api/users/setRoles")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(rolesBody(EMAIL, 999L)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Unknown role"));
        }

        @Test
        void takingAwayTheOwnPermissionToManageUsers_returns400() throws Exception {
            User manager = userWith(Permission.MANAGE_USERS);

            mockMvc.perform(post("/api/users/setRoles")
                            .header(HttpHeaders.AUTHORIZATION, bearer(manager))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(rolesBody(manager.getEmail())))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string(LOCKOUT));
        }

        @Test
        void withoutEmail_returns400() throws Exception {
            mockMvc.perform(post("/api/users/setRoles")
                            .header(HttpHeaders.AUTHORIZATION, bearerWith(Permission.MANAGE_USERS))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(Map.of("roleIds", List.of()))))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Email must not be empty"));
        }
    }

    private User registered(String email) {
        RegisterRequest request = new RegisterRequest();
        request.setEmail(email);
        request.setPassword(UserControllerTest.PASSWORD);
        request.setFirstname("Anna");
        request.setLastname("Test");
        return inDatastore(() -> userRepository.register(request));
    }

    private void giveRoles(User user, Long... roleIds) {
        inDatastore(() -> {
            User stored = userRepository.getByEmail(user.getEmail());
            stored.getRoleIds().addAll(List.of(roleIds));
            return userRepository.save(stored);
        });
    }

    private String registerBody(String email, String password) throws Exception {
        return json(Map.of("email", email, "password", password, "firstname", "Anna", "lastname", "Test"));
    }

    private ResultActions register(String email, String password) throws Exception {
        return mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody(email, password)));
    }

    private String nameBody(String firstname, String lastname) throws Exception {
        return json(Map.of("firstname", firstname, "lastname", lastname));
    }

    private String rolesBody(String email, Long... roleIds) throws Exception {
        return json(Map.of("email", email, "roleIds", List.of(roleIds)));
    }

    private ResultActions login(String email, String password) throws Exception {
        return mockMvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("email", email, "password", password))));
    }

    /** Logs in the way Cloud Run passes a request on: with the client address in X-Forwarded-For. */
    private ResultActions loginFrom(String forwardedFor, String password) throws Exception {
        return mockMvc.perform(post("/api/users/login")
                .header("X-Forwarded-For", forwardedFor)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("email", UserControllerTest.EMAIL, "password", password))));
    }

    private ResultActions requestPasswordReset(String email) throws Exception {
        return mockMvc.perform(post("/api/users/requestPasswordReset")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("email", email))));
    }

    private ResultActions resetPassword(String token, String password) throws Exception {
        return mockMvc.perform(post("/api/users/resetPassword")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("token", token, "password", password))));
    }

    private List<PasswordResetToken> resetTokensOf(User user) {
        return inDatastore(() -> new PasswordResetTokenDAO().getByUserId(user.getId()));
    }

    /**
     * The real token only exists in the reset mail, the database holds its SHA-256 hash.
     * So a test stores the hash of a token it knows.
     */
    private void storeResetToken(User user, String token, Date expiresAt) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
        String hash = HexFormat.of().formatHex(digest);
        inDatastore(() -> new PasswordResetTokenDAO().save(new PasswordResetToken(hash, user.getId(), expiresAt)));
    }

    private static Date minutesFromNow(int minutes) {
        return new Date(System.currentTimeMillis() + minutes * 60_000L);
    }
}
