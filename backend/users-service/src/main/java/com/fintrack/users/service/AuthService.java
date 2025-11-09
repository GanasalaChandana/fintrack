package com.fintrack.users.service;

import com.fintrack.users.dto.AuthResponse;
import com.fintrack.users.dto.LoginRequest;
import com.fintrack.users.dto.RegisterRequest;
import com.fintrack.users.entity.User;
import com.fintrack.users.repository.UserRepository;
import com.fintrack.users.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());
        return buildAuthResponse(token, user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        log.info("User logged in successfully: {}", user.getEmail());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());
        return buildAuthResponse(token, user);
    }

    /** Used by controllers that need the full User by email/username */
    @Transactional(readOnly = true)
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .build();

        return AuthResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }
}
