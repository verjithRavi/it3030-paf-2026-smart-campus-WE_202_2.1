package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.LoginRequest;
import com.smcsystem.smart_campus_system.dto.request.RegisterRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateUserRoleRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateUserStatusRequest;
import com.smcsystem.smart_campus_system.dto.response.AuthResponse;
import com.smcsystem.smart_campus_system.dto.response.UserResponse;
import com.smcsystem.smart_campus_system.enums.AuthProvider;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.UserType;
import com.smcsystem.smart_campus_system.exception.BadRequestException;
import com.smcsystem.smart_campus_system.exception.ResourceNotFoundException;
import com.smcsystem.smart_campus_system.exception.UnauthorizedException;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.UserRepository;
import com.smcsystem.smart_campus_system.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .userType(request.getUserType())
                .authProvider(AuthProvider.LOCAL)
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .isActive(true)
                .emailVerified(true)
                .build();

        User savedUser;
        try {
            savedUser = userRepository.save(user);
        } catch (DuplicateKeyException ex) {
            throw new BadRequestException("Email is already registered");
        }

        String token = jwtService.generateToken(
                savedUser.getEmail(),
                savedUser.getId(),
                savedUser.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .userType(savedUser.getUserType())
                .authProvider(savedUser.getAuthProvider())
                .pictureUrl(savedUser.getPictureUrl())
                .profileCompleted(true)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Your account is inactive");
        }

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        user.setLastLoginAt(java.time.LocalDateTime.now());
        User updatedUser = userRepository.save(user);

        String token = jwtService.generateToken(
                updatedUser.getEmail(),
                updatedUser.getId(),
                updatedUser.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .userId(updatedUser.getId())
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .role(updatedUser.getRole())
                .userType(updatedUser.getUserType())
                .authProvider(updatedUser.getAuthProvider())
                .pictureUrl(updatedUser.getPictureUrl())
                .profileCompleted(updatedUser.getUserType() != null)
                .build();
    }

    @Override
    public AuthResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("User not authenticated");
        }

        return AuthResponse.builder()
                .token(null)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .userType(user.getUserType())
                .authProvider(user.getAuthProvider())
                .pictureUrl(user.getPictureUrl())
                .profileCompleted(user.getUserType() != null)
                .build();
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    public UserResponse updateUserRole(String userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRole(request.getRole());

        if (request.getRole() == Role.ADMIN || request.getRole() == Role.TECHNICIAN) {
            user.setUserType(null);
        } else if (request.getRole() == Role.USER) {
            if (request.getUserType() == null) {
                throw new BadRequestException("User type is required when role is USER");
            }

            if (request.getUserType() != UserType.STUDENT && request.getUserType() != UserType.LECTURER) {
                throw new BadRequestException("User type must be STUDENT or LECTURER when role is USER");
            }

            user.setUserType(request.getUserType());
        }

        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }

    @Override
    public UserResponse updateUserStatus(String userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setIsActive(request.getIsActive());
        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .userType(user.getUserType())
                .authProvider(user.getAuthProvider())
                .pictureUrl(user.getPictureUrl())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
