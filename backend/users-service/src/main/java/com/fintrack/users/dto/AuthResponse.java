package com.fintrack.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private UserDto user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private UUID id; // IMPORTANT: Must be UUID, not Long!
        private String email;
        private String username;
        private String firstName;
        private String lastName;
        private String role;
        private String profilePicture;
    }
}