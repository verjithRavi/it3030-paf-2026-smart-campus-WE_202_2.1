package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.LoginRequest;
import com.smcsystem.smart_campus_system.dto.request.RegisterRequest;
import com.smcsystem.smart_campus_system.dto.response.AuthResponse;
import com.smcsystem.smart_campus_system.enums.AuthProvider;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.exception.BadRequestException;
import com.smcsystem.smart_campus_system.exception.UnauthorizedException;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

        return AuthResponse.builder()
                .token(null)
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
        throw new UnauthorizedException("Login not implemented yet");
    }
}
