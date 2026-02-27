package com.fintrack.users.service;

import com.fintrack.users.dto.AuthResponse;
import com.fintrack.users.dto.LoginRequest;
import com.fintrack.users.dto.RegisterRequest;
import com.fintrack.users.entity.User;
import com.fintrack.users.enums.Role; // ADD THIS IMPORT
import com.fintrack.users.repository.UserRepository;
import com.fintrack.users.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtUtil jwtUtil;

        @Transactional
        public AuthResponse register(RegisterRequest request) {
                // Check if user already exists
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email already registered");
                }

                // Create new user
                User user = User.builder()
                                .email(request.getEmail())
                                .username(request.getUsername())
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .role(Role.USER) // Changed from User.Role.USER
                                .build();

                User savedUser = userRepository.save(user);
                log.info("New user registered: {}", savedUser.getEmail());

                // Generate JWT token
                String token = jwtUtil.generateToken(savedUser);
                String refreshToken = jwtUtil.generateRefreshToken(savedUser);

                // Build response
                AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                                .id(savedUser.getId()) // Now UUID instead of Long
                                .email(savedUser.getEmail())
                                .username(savedUser.getUsername())
                                .firstName(savedUser.getFirstName())
                                .lastName(savedUser.getLastName())
                                .role(savedUser.getRole().toString())
                                .build();

                return AuthResponse.builder()
                                .token(token)
                                .refreshToken(refreshToken)
                                .user(userDto)
                                .build();
        }

        @Transactional(readOnly = true)
        public AuthResponse login(LoginRequest request) {
                // Find user by email
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

                // Verify password
                if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                        throw new RuntimeException("Invalid credentials");
                }

                log.info("User logged in: {}", user.getEmail());

                // Generate JWT token
                String token = jwtUtil.generateToken(user);
                String refreshToken = jwtUtil.generateRefreshToken(user);

                // Build response
                AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                                .id(user.getId()) // Now UUID instead of Long
                                .email(user.getEmail())
                                .username(user.getUsername())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .role(user.getRole().toString())
                                .build();

                return AuthResponse.builder()
                                .token(token)
                                .refreshToken(refreshToken)
                                .user(userDto)
                                .build();
        }

        @Transactional(readOnly = true)
        public AuthResponse refreshToken(String refreshToken) {
                // Validate it's actually a refresh token
                if (!jwtUtil.isRefreshToken(refreshToken)) {
                        throw new IllegalArgumentException("Invalid refresh token");
                }

                // Check token is not expired
                if (!jwtUtil.isTokenValid(refreshToken)) {
                        throw new IllegalArgumentException("Refresh token has expired");
                }

                // Extract email and load user
                String email = jwtUtil.extractEmail(refreshToken);
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                log.info("🔄 Refreshing token for user: {}", email);

                // Issue new access token (and rotate refresh token)
                String newToken = jwtUtil.generateToken(user);
                String newRefreshToken = jwtUtil.generateRefreshToken(user);

                AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                                .id(user.getId())
                                .email(user.getEmail())
                                .username(user.getUsername())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .role(user.getRole().toString())
                                .build();

                return AuthResponse.builder()
                                .token(newToken)
                                .refreshToken(newRefreshToken)
                                .user(userDto)
                                .build();
        }

        @Transactional(readOnly = true)
        public User getCurrentUser(String email) {
                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
        }

}
