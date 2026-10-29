package de.jan.exceptions;

import de.jan.mail.ErrorMailService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/** Mails the admin about exceptions no handler resolved, which end as a 500; the response stays the same. */
@Component
public class ErrorMailFilter extends OncePerRequestFilter {

    private final ErrorMailService errorMailService;

    public ErrorMailFilter(ErrorMailService errorMailService) {
        this.errorMailService = errorMailService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        try {
            chain.doFilter(request, response);
        } catch (ServletException | IOException | RuntimeException e) {
            Throwable error = e instanceof ServletException servletException && servletException.getRootCause() != null
                    ? servletException.getRootCause() : e;
            errorMailService.report(request.getMethod(), request.getRequestURI(), error);
            throw e;
        }
    }
}
