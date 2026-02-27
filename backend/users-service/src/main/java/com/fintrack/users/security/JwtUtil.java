package com.fintrack.users.security;

import com.fintrack.users.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // Default 24 hours
    private Long expiration;

    @Value("${jwt.refresh-expiration:604800000}") // Default 7 days
    private Long refreshExpiration;

    private SecretKey getSigningKey() {
        // Ensure the secret is at least 256 bits (32 bytes) for HS256
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Generate token from User object
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole() != null ? user.getRole().toString() : "USER");

        log.debug("🔐 Generating token for user: {} (ID: {})", user.getEmail(), user.getId());
        return createToken(claims, user.getEmail());
    }

    // Generate token from username/email string (for backward compatibility)
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        String token = Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();

        log.debug("✅ Token created for: {} (expires: {})", subject, expiryDate);
        return token;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.error("❌ Failed to parse JWT token: {}", e.getMessage());
            throw e;
        }
    }

    private Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            log.error("❌ Token expiration check failed: {}", e.getMessage());
            return true; // Treat as expired if we can't check
        }
    }

    // Existing method - validate with username string
    public Boolean validateToken(String token, String username) {
        try {
            final String extractedUsername = extractUsername(token);
            boolean isValid = (extractedUsername.equals(username) && !isTokenExpired(token));

            if (isValid) {
                log.debug("✅ Token validated successfully for: {}", username);
            } else {
                log.warn("❌ Token validation failed for: {} (extracted: {})", username, extractedUsername);
            }

            return isValid;
        } catch (Exception e) {
            log.error("❌ Token validation error: {}", e.getMessage());
            return false;
        }
    }

    // NEW METHOD - validate with UserDetails (for Spring Security)
    public Boolean validateToken(String token, UserDetails userDetails) {
        return validateToken(token, userDetails.getUsername());
    }

    // NEW METHOD - simple token validity check (no user comparison)
    public Boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            log.error("❌ Token validity check failed: {}", e.getMessage());
            return false;
        }
    }

    // Helper method to extract user ID from token
    public String extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", String.class);
    }

    // Helper method to extract email from token
    public String extractEmail(String token) {
        Claims claims = extractAllClaims(token);
        Object email = claims.get("email");
        return email != null ? email.toString() : extractUsername(token);
    }

    // Generate a long-lived refresh token (7 days by default)
    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("email", user.getEmail());
        claims.put("tokenType", "refresh");

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);

        log.debug("🔄 Generating refresh token for user: {} (expires: {})", user.getEmail(), expiryDate);

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    // Check whether a token is a refresh token (has tokenType=refresh claim)
    public boolean isRefreshToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "refresh".equals(claims.get("tokenType", String.class));
        } catch (Exception e) {
            log.error("❌ Failed to check refresh token type: {}", e.getMessage());
            return false;
        }
    }
}