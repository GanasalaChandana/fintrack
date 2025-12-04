package com.fintrack.users.controller;

import com.fintrack.users.dto.GoogleAuthRequest;
import com.fintrack.users.dto.LoginRequest;
import com.fintrack.users.dto.RegisterRequest;
import com.fintrack.users.dto.AuthResponse;
import com.fintrack.users.service.AuthService;
import com.fintrack.users.service.GoogleAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://fintrack-liart.vercel.app"
}, allowCredentials = "true", maxAge = 3600)
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    // ✅ Simple in-memory rate limiting (prevents duplicate requests)
    private final ConcurrentHashMap<String, Long> requestCache = new ConcurrentHashMap<>();
    private static final long REQUEST_COOLDOWN = 2000; // 2 seconds

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // ✅ Prevent duplicate requests
            String cacheKey = "register_" + request.getEmail();
            if (isDuplicateRequest(cacheKey)) {
                log.warn("⚠️ Duplicate registration request blocked for: {}", request.getEmail());
                return ResponseEntity
                        .status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of(
                                "error", "Too many requests",
                                "message", "Please wait a moment and try again"));
            }

            log.info("📝 Registration attempt for email: {}", request.getEmail());
            AuthResponse response = authService.register(request);
            log.info("✅ Registration successful for: {}", request.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Registration failed: {}", e.getMessage());

            // ✅ Better error status codes
            HttpStatus status = HttpStatus.BAD_REQUEST;
            if (e.getMessage() != null && e.getMessage().contains("already registered")) {
                status = HttpStatus.CONFLICT; // 409
            }

            return ResponseEntity
                    .status(status)
                    .body(Map.of("error", e.getMessage(), "message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // ✅ Prevent duplicate requests
            String cacheKey = "login_" + request.getEmail();
            if (isDuplicateRequest(cacheKey)) {
                log.warn("⚠️ Duplicate login request blocked for: {}", request.getEmail());
                return ResponseEntity
                        .status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of(
                                "error", "Too many requests",
                                "message", "Please wait a moment and try again"));
            }

            log.info("🔐 Login attempt for email: {}", request.getEmail());
            AuthResponse response = authService.login(request);
            log.info("✅ Login successful for: {}", request.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Login failed: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage(), "message", e.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody GoogleAuthRequest request) {
        try {
            // ✅ Prevent duplicate Google auth requests (using shorter credential hash)
            String credentialHash = String.valueOf(
                    request.getCredential() != null ? request.getCredential().hashCode() : 0);
            String cacheKey = "google_" + credentialHash;

            if (isDuplicateRequest(cacheKey)) {
                log.warn("⚠️ Duplicate Google auth request blocked");
                return ResponseEntity
                        .status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of(
                                "error", "Too many requests",
                                "message", "Please wait a moment and try again"));
            }

            log.info("🔵 Google authentication attempt");
            log.info("📥 Received credential length: {}",
                    request.getCredential() != null ? request.getCredential().length() : 0);
            log.info("📥 Client ID: {}", request.getClientId());

            // ✅ Validate request
            if (request.getCredential() == null || request.getCredential().isEmpty()) {
                log.error("❌ Missing Google credential");
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "error", "Missing credential",
                                "message", "Google credential is required"));
            }

            AuthResponse response = googleAuthService.authenticateWithGoogle(request.getCredential());

            log.info("✅ Google authentication successful");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            // ✅ Handle validation errors (400)
            log.error("❌ Google authentication validation error: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "message", "Invalid Google credential"));

        } catch (Exception e) {
            // ✅ Handle server errors (500)
            log.error("❌ Google authentication failed: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "message", "Google authentication failed. Please try again."));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "auth-service",
                "timestamp", System.currentTimeMillis()));
    }

    // ✅ Helper method to prevent duplicate requests
    private boolean isDuplicateRequest(String cacheKey) {
        Long lastRequestTime = requestCache.get(cacheKey);
        long currentTime = System.currentTimeMillis();

        if (lastRequestTime != null && (currentTime - lastRequestTime) < REQUEST_COOLDOWN) {
            return true; // Duplicate request detected
        }

        requestCache.put(cacheKey, currentTime);

        // ✅ Cleanup old entries (prevent memory leak)
        if (requestCache.size() > 1000) {
            requestCache.entrySet().removeIf(entry -> (currentTime - entry.getValue()) > REQUEST_COOLDOWN * 10);
        }

        return false;
    }
}