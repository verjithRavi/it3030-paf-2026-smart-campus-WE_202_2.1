package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.UserType;
import com.smcsystem.smart_campus_system.exception.ResourceNotFoundException;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserIdentityService {

    private final UserRepository userRepository;

    public User ensureUserId(User user) {
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user;
        }

        user.setUsername(generateNextUserId(user.getRole(), user.getUserType()));
        return user;
    }

    public User ensureUserIdAndSave(User user) {
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user;
        }

        user.setUsername(generateNextUserId(user.getRole(), user.getUserType()));
        return userRepository.save(user);
    }

    public User findByPublicUserId(String publicUserIdOrInternalId) {
        return userRepository.findByUsername(publicUserIdOrInternalId)
                .or(() -> userRepository.findById(publicUserIdOrInternalId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String generateNextUserId(Role role, UserType userType) {
        String prefix = resolvePrefix(role, userType);
        int nextSequence = userRepository
                .findFirstByUsernameStartingWithOrderByUsernameDesc(prefix)
                .map(User::getUsername)
                .map(this::extractSequence)
                .orElse(0) + 1;

        return prefix + String.format("%04d", nextSequence);
    }

    private int extractSequence(String username) {
        return Integer.parseInt(username.substring(1));
    }

    private String resolvePrefix(Role role, UserType userType) {
        if (role == Role.ADMIN) {
            return "A";
        }

        if (role == Role.TECHNICIAN) {
            return "T";
        }

        if (userType == UserType.LECTURER) {
            return "L";
        }

        return "S";
    }
}
