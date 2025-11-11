package com.fintrack.gateway.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser() // Changed from parserBuilder()
                    .verifyWith(getSigningKey()) // Changed from setSigningKey()
                    .build()
                    .parseSignedClaims(token); // Changed from parseClaimsJws()
            log.debug("Token validated successfully");
            return true;
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            log.error("JWT token is malformed: {}", e.getMessage());
            return false;
        } catch (JwtException e) { // Changed from SignatureException
            log.error("JWT signature validation failed: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.error("JWT token is invalid: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Unexpected error during JWT validation", e);
            return false;
        }
    }

    /**
     * Extract user ID from token (stored in subject)
     */
    public String extractUserId(String token) {
        try {
            Claims claims = Jwts.parser() // Changed from parserBuilder()
                    .verifyWith(getSigningKey()) // Changed from setSigningKey()
                    .build()
                    .parseSignedClaims(token) // Changed from parseClaimsJws()
                    .getPayload(); // Changed from getBody()

            String userId = claims.getSubject();
            log.debug("Extracted user ID: {}", userId);
            return userId;
        } catch (Exception e) {
            log.error("Error extracting user ID from token", e);
            return null;
        }
    }

    /**
     * Extract email from token
     */
    public String extractEmail(String token) {
        try {
            Claims claims = Jwts.parser() // Changed from parserBuilder()
                    .verifyWith(getSigningKey()) // Changed from setSigningKey()
                    .build()
                    .parseSignedClaims(token) // Changed from parseClaimsJws()
                    .getPayload(); // Changed from getBody()

            String email = claims.get("email", String.class);
            log.debug("Extracted email: {}", email);
            return email;
        } catch (Exception e) {
            log.error("Error extracting email from token", e);
            return null;
        }
    }

    /**
     * Extract all claims from token (useful for debugging)
     */
    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parser() // Changed from parserBuilder()
                    .verifyWith(getSigningKey()) // Changed from setSigningKey()
                    .build()
                    .parseSignedClaims(token) // Changed from parseClaimsJws()
                    .getPayload(); // Changed from getBody()
        } catch (Exception e) {
            log.error("Error extracting claims from token", e);
            return null;
        }
    }
}