package com.smcsystem.smart_campus_system.config;

import com.smcsystem.smart_campus_system.enums.ApprovalStatus;
import com.smcsystem.smart_campus_system.enums.AuthProvider;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrapConfig {

    private static final Logger logger = LoggerFactory.getLogger(AdminBootstrapConfig.class);

    @Bean
    CommandLineRunner bootstrapAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin.enabled:true}") boolean enabled,
            @Value("${app.bootstrap.admin.name:Local Admin}") String adminName,
            @Value("${app.bootstrap.admin.email:admin@smartcampus.local}") String adminEmail,
            @Value("${app.bootstrap.admin.password:Admin@12345}") String adminPassword
    ) {
        return args -> {
            if (!enabled) {
                return;
            }

            boolean adminExists = userRepository.findAll()
                    .stream()
                    .anyMatch(user -> user.getRole() == Role.ADMIN);

            if (adminExists) {
                return;
            }

            String normalizedEmail = adminEmail.trim().toLowerCase();

            if (userRepository.existsByEmail(normalizedEmail)) {
                logger.warn("Bootstrap admin skipped because email {} already exists with a non-admin role.", normalizedEmail);
                return;
            }

            User admin = User.builder()
                    .name(adminName.trim())
                    .email(normalizedEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .authProvider(AuthProvider.LOCAL)
                    .isActive(true)
                    .emailVerified(true)
                    .approvalStatus(ApprovalStatus.APPROVED)
                    .build();

            userRepository.save(admin);

            logger.warn("Created bootstrap admin for local development: email='{}' password='{}'", normalizedEmail, adminPassword);
        };
    }
}
