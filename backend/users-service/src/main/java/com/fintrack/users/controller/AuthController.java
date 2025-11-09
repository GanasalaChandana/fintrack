package com.fintrack.users.controller;

import com.fintrack.users.dto.AuthResponse;
import com.fintrack.users.dto.LoginRequest;
import com.fintrack.users.dto.RegisterRequest;
import com.fintrack.users.entity.User;
import com.fintrack.users.security.JwtUtil;
import com.fintrack.users.service.AuthService;
import jakarta.validation.Valid;
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
// @CrossOrigin(origins = "*") // <-- REMOVE THIS LINE
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Missing or invalid Authorization header"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);

            User user = authService.getCurrentUser(email);

            AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole().toString())
                    .build();

            AuthResponse response = AuthResponse.builder()
                    .token(token)
                    .user(userDto)
                    .build();

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Get current user failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}