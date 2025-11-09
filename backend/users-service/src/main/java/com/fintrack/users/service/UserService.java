package com.fintrack.users.service;

import com.fintrack.users.entity.User;
import com.fintrack.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    // Add overload for String ID (converts to UUID)
    public Optional<User> findById(String id) {
        try {
            return userRepository.findById(UUID.fromString(id));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public void deleteById(UUID id) {
        userRepository.deleteById(id);
    }

    // Add overload for String ID (converts to UUID)
    public void deleteById(String id) {
        try {
            userRepository.deleteById(UUID.fromString(id));
        } catch (IllegalArgumentException e) {
            // Handle invalid UUID
        }
    }
}