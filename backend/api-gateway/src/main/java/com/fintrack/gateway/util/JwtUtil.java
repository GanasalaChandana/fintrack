package com.fintrack.gateway.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    /**
     * Get the signing key for JWT validation
     * IMPORTANT: This must match the secret used by your auth-service!
     */
    private SecretKey getSigningKey() {
        // Use UTF-8 encoding of the secret string
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            log.debug("✅ Token validated successfully");
            return true;
        } catch (ExpiredJwtException e) {
            log.error("❌ JWT token is expired: {}", e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            log.error("❌ JWT token is unsupported: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            log.error("❌ JWT token is malformed: {}", e.getMessage());
            return false;
        } catch (JwtException e) {
            log.error("❌ JWT signature validation failed: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.error("❌ JWT token is invalid: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("❌ Unexpected error during JWT validation", e);
            return false;
        }
    }

    /**
     * Extract user ID from token
     * First tries 'sub' (standard JWT claim), then falls back to 'email'
     */
    public String extractUserId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Try 'sub' first (standard JWT subject claim)
            String userId = claims.getSubject();

            // Fallback to 'email' if sub is null/empty
            if (userId == null || userId.isEmpty()) {
                userId = claims.get("email", String.class);
            }

            // Fallback to 'userId' custom claim
            if (userId == null || userId.isEmpty()) {
                userId = claims.get("userId", String.class);
            }

            log.debug("📧 Extracted user ID: {}", userId);
            return userId;
        } catch (Exception e) {
            log.error("❌ Error extracting user ID from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract email from token (useful for logging/debugging)
     */
    public String extractEmail(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String email = claims.get("email", String.class);
            log.debug("📧 Extracted email: {}", email);
            return email;
        } catch (Exception e) {
            log.error("❌ Error extracting email from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract role from token
     */
    public String extractRole(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String role = claims.get("role", String.class);
            log.debug("👤 Extracted role: {}", role);
            return role;
        } catch (Exception e) {
            log.error("❌ Error extracting role from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract all claims from token (useful for debugging)
     */
    public Claims extractAllClaims(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            log.debug("📋 All claims: {}", claims);
            return claims;
        } catch (Exception e) {
            log.error("❌ Error extracting claims from token: {}", e.getMessage());
            return null;
        }
    }
}
