package com.fintrack.users.security;

import com.fintrack.users.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Skip JWT validation for public endpoints
        return path.startsWith("/api/auth/") ||
                path.startsWith("/oauth2/") ||
                path.startsWith("/login/oauth2/") ||
                path.startsWith("/actuator/") ||
                path.startsWith("/swagger-ui/") ||
                path.startsWith("/v3/api-docs/") ||
                path.endsWith("/health") ||
                path.equals("/error");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String requestPath = request.getRequestURI();
        final String authHeader = request.getHeader("Authorization");

        // Skip JWT validation for public endpoints
        if (isPublicEndpoint(requestPath)) {
            log.debug("⚪ Public endpoint: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        // Check if Authorization header exists
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("⚠️ No valid Authorization header for protected endpoint: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Extract token
            final String jwt = authHeader.substring(7);
            log.debug("🔑 Validating JWT token for endpoint: {}", requestPath);

            // Extract email from token
            final String userEmail = jwtUtil.extractUsername(jwt);

            // If user is not already authenticated
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Load user details
                UserDetails userDetails = userService.loadUserByUsername(userEmail);

                // Validate token
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    log.info("✅ JWT valid for user: {}", userEmail);

                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication in context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("🔒 User authenticated: {}", userEmail);
                } else {
                    log.warn("❌ Invalid JWT token for user: {}", userEmail);
                }
            }

        } catch (Exception e) {
            log.error("❌ JWT Authentication Error: {}", e.getMessage());
            // Don't throw - let the request continue and fail at authorization
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Check if the endpoint is public (doesn't require authentication)
     */
    private boolean isPublicEndpoint(String path) {
        return path.startsWith("/api/auth/") ||
                path.startsWith("/oauth2/") ||
                path.startsWith("/login/oauth2/") ||
                path.startsWith("/actuator/") ||
                path.equals("/error") ||
                path.endsWith("/health");
    }
}