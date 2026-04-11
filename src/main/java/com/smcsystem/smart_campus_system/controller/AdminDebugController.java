package com.smcsystem.smart_campus_system.controller;

import com.smcsystem.smart_campus_system.enums.ApprovalStatus;
import com.smcsystem.smart_campus_system.enums.AuthProvider;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.UserRepository;
import com.smcsystem.smart_campus_system.service.UserIdentityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/debug")
@RequiredArgsConstructor
public class AdminDebugController {

    private final UserRepository userRepository;
    private final UserIdentityService userIdentityService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/create-admin")
    public ResponseEntity<String> createAdmin() {
        // Check if admin already exists
        User existingAdmin = userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .findFirst()
                .orElse(null);

        if (existingAdmin != null) {
            return ResponseEntity.ok("Admin already exists. Email: " + existingAdmin.getEmail());
        }

        // Create admin user
        User admin = User.builder()
                .name("Debug Admin")
                .email("admin@debug.local")
                .username(null)
                .password(passwordEncoder.encode("Admin@12345"))
                .role(Role.ADMIN)
                .authProvider(AuthProvider.LOCAL)
                .isActive(true)
                .emailVerified(true)
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();

        User savedAdmin = userRepository.save(admin);
        userIdentityService.ensureUserIdAndSave(savedAdmin);

        return ResponseEntity.ok("Admin created successfully. Email: admin@debug.local, Password: Admin@12345");
    }

    @PostMapping("/reset-admin-password")
    public ResponseEntity<String> resetAdminPassword() {
        User existingAdmin = userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .findFirst()
                .orElse(null);

        if (existingAdmin == null) {
            return ResponseEntity.badRequest().body("No admin found");
        }

        // Reset password to Admin@12345
        existingAdmin.setPassword(passwordEncoder.encode("Admin@12345"));
        userRepository.save(existingAdmin);

        return ResponseEntity.ok("Admin password reset. Email: " + existingAdmin.getEmail() + ", Password: Admin@12345");
    }
}
