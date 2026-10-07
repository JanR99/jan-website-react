package de.jan.security;

import de.jan.exceptions.UnauthenticatedException;
import de.jan.user.User;
import de.jan.user.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * Resolves parameters annotated with {@link CurrentUser}: validates the Bearer token from the
 * Authorization header and loads the user once for this request.
 */
@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public CurrentUserArgumentResolver(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && User.class.isAssignableFrom(parameter.getParameterType());
    }

    @Override
    public User resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        String authHeader = webRequest.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith(JwtService.BEARER_PREFIX)) {
            throw new UnauthenticatedException();
        }

        JwtService.Token token;
        try {
            token = jwtService.parse(authHeader.substring(JwtService.BEARER_PREFIX.length()));
        } catch (JwtException | IllegalArgumentException e) {
            // invalid, expired or empty token
            throw new UnauthenticatedException();
        }

        User user = userRepository.getByEmail(token.email());
        if (user == null) {
            // valid token, but the account no longer exists
            throw new UnauthenticatedException();
        }
        if (token.version() != user.getTokenVersion()) {
            // the password was changed after this token was issued
            throw new UnauthenticatedException();
        }
        return user;
    }
}
