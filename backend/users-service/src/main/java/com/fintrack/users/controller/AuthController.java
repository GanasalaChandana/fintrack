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

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "https://accounts.google.com",
        "https://content-accounts.google.com",
        "https://gsi.google.com",
        "https://fintrack-liart.vercel.app"
}, allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.OPTIONS }, allowCredentials = "true")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            log.info("📝 Registration attempt for email: {}", request.getEmail());
            AuthResponse response = authService.register(request);
            log.info("✅ Registration successful for: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Registration failed: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage(), "message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
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
            log.info("🔵 Google authentication attempt");
            log.info("📥 Received credential length: {}",
                    request.getCredential() != null ? request.getCredential().length() : 0);
            log.info("📥 Client ID: {}", request.getClientId());

            AuthResponse response = googleAuthService.authenticateWithGoogle(request.getCredential());

            log.info("✅ Google authentication successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Google authentication failed: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", e.getMessage(),
                            "message", "Google authentication failed. Please try again.",
                            "details", e.getClass().getSimpleName()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "auth-service",
                "timestamp", System.currentTimeMillis()));
    }
}