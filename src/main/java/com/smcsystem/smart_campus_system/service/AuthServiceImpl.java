package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.request.CreateManagedUserRequest;
import com.smcsystem.smart_campus_system.dto.request.LoginRequest;
import com.smcsystem.smart_campus_system.dto.request.RegisterRequest;
import com.smcsystem.smart_campus_system.dto.request.SubmitAccessRequestRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateApprovalStatusRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateManagedUserRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateProfileRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateUserRoleRequest;
import com.smcsystem.smart_campus_system.dto.request.UpdateUserStatusRequest;
import com.smcsystem.smart_campus_system.dto.response.AuthResponse;
import com.smcsystem.smart_campus_system.dto.response.UserResponse;
import com.smcsystem.smart_campus_system.enums.AuthProvider;
import com.smcsystem.smart_campus_system.enums.ApprovalStatus;
import com.smcsystem.smart_campus_system.enums.NotificationType;
import com.smcsystem.smart_campus_system.enums.RegistrationType;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.UserType;
import com.smcsystem.smart_campus_system.exception.BadRequestException;
import com.smcsystem.smart_campus_system.exception.UnauthorizedException;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.NotificationRepository;
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
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NotificationService notificationService;
    private final UserIdentityService userIdentityService;

    private void notifyAdmins(String title, String message, NotificationType type, String relatedEntityId) {
        userRepository.findAll().stream()
                .filter(existingUser -> existingUser.getRole() == Role.ADMIN)
                .forEach(admin ->
                        notificationService.createNotification(
                                admin.getId(),
                                title,
                                message,
                                type,
                                relatedEntityId
                        )
                );
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (request.getRegistrationType() != RegistrationType.STUDENT) {
            throw new BadRequestException("Only student self-registration is available. Lecturer, technician, and admin accounts must be created by an administrator");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        UserType userType = mapRegistrationTypeToUserType(request.getRegistrationType());
        ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .username(null)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .userType(userType)
                .authProvider(AuthProvider.LOCAL)
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .isActive(true)
                .emailVerified(true)
                .approvalStatus(approvalStatus)
                .build();

        User savedUser;
        try {
            savedUser = userRepository.save(user);
            savedUser = userIdentityService.ensureUserIdAndSave(savedUser);
        } catch (DuplicateKeyException ex) {
            throw new BadRequestException("Email is already registered");
        }

        notifyAdmins(
                "New Approval Request",
                savedUser.getName() + " registered as " + savedUser.getUserType() + " and is waiting for approval.",
                NotificationType.ACCESS_REQUEST_SUBMITTED,
                savedUser.getId()
        );

        return buildAuthResponse(savedUser, approvalStatus == ApprovalStatus.APPROVED);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();

        User user = userRepository.findByEmail(identifier.toLowerCase())
                .or(() -> userRepository.findByUsername(identifier.toUpperCase()))
                .orElseThrow(() -> new UnauthorizedException("Invalid email or user ID or password"));

        user = userIdentityService.ensureUserIdAndSave(user);

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Your account is inactive");
        }

        if (user.getApprovalStatus() == ApprovalStatus.PENDING) {
            throw new UnauthorizedException("Your account is waiting for admin approval");
        }

        if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
            throw new UnauthorizedException("Your account request was rejected");
        }

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or user ID or password");
        }

        user.setLastLoginAt(java.time.LocalDateTime.now());
        User updatedUser = userRepository.save(user);

        return buildAuthResponse(updatedUser, true);
    }

    @Override
    public AuthResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("User not authenticated");
        }

        user = userIdentityService.ensureUserIdAndSave(user);
        return buildAuthResponse(user, false);
    }

    @Override
    public AuthResponse submitAccessRequest(SubmitAccessRequestRequest request) {
        User user = getAuthenticatedUser();

        if (user.getRole() != Role.USER) {
            throw new BadRequestException("Only user accounts can submit access requests");
        }

        if (request.getRequestedRole() != null) {
            throw new BadRequestException("Role requests are not available from profile updates");
        }

        if (request.getRequestedUserType() == null) {
            throw new BadRequestException("Select STUDENT to submit an access request");
        }

        if (request.getRequestedUserType() != UserType.STUDENT) {
            throw new BadRequestException("Only STUDENT access can be requested here");
        }

        if (request.getRequestedUserType() == user.getUserType()
                && user.getApprovalStatus() == ApprovalStatus.APPROVED) {
            throw new BadRequestException("You already have this approved user type");
        }

        user.setRequestedUserType(request.getRequestedUserType());
        user.setRequestedRole(null);

        User updatedUser = userRepository.save(user);

        notifyAdmins(
                "Access Request Submitted",
                updatedUser.getName() + " requested " + updatedUser.getRequestedUserType() + " access.",
                NotificationType.ACCESS_REQUEST_SUBMITTED,
                updatedUser.getId()
        );

        return buildAuthResponse(updatedUser, false);
    }

    @Override
    public AuthResponse updateCurrentUserProfile(UpdateProfileRequest request) {
        User user = getAuthenticatedUser();
        boolean emailChanged = false;

        if (request.getEmail() != null) {
            String email = request.getEmail().trim().toLowerCase();

            if (email.isEmpty()) {
                throw new BadRequestException("Email is required");
            }

            if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
                throw new BadRequestException("Email is already registered");
            }

            emailChanged = !email.equals(user.getEmail());
            user.setEmail(email);
        }

        if (request.getName() != null) {
            user.setName(request.getName().trim());
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }

        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }

        if (request.getPictureUrl() != null) {
            String pictureUrl = request.getPictureUrl().trim();
            user.setPictureUrl(pictureUrl.isEmpty() ? null : pictureUrl);
        }

        boolean hasPasswordChangeRequest =
                request.getCurrentPassword() != null
                        || request.getNewPassword() != null
                        || request.getConfirmNewPassword() != null;

        if (hasPasswordChangeRequest) {
            if (user.getAuthProvider() != AuthProvider.LOCAL || user.getPassword() == null) {
                throw new BadRequestException("Password changes are available only for local accounts");
            }

            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new BadRequestException("Current password is required");
            }

            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("Current password is incorrect");
            }

            if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
                throw new BadRequestException("New password is required");
            }

            if (request.getNewPassword().length() < 8) {
                throw new BadRequestException("New password must be at least 8 characters");
            }

            if (request.getConfirmNewPassword() == null || request.getConfirmNewPassword().isBlank()) {
                throw new BadRequestException("Please confirm your new password");
            }

            if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
                throw new BadRequestException("New password and confirm password do not match");
            }

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        if (request.getRequestedUserType() != null) {
            if (user.getRole() != Role.USER) {
                throw new BadRequestException("Only user accounts can request student or lecturer access");
            }

            if (request.getRequestedUserType() != UserType.STUDENT) {
                throw new BadRequestException("Requested user type must be STUDENT");
            }

            if (request.getRequestedUserType() == user.getUserType()
                    && user.getApprovalStatus() == ApprovalStatus.APPROVED) {
                throw new BadRequestException("You already have this approved user type");
            }

            user.setRequestedUserType(request.getRequestedUserType());
            user.setRequestedRole(null);
        }

        User updatedUser = userRepository.save(user);
        return buildAuthResponse(updatedUser, emailChanged);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userIdentityService::ensureUserIdAndSave)
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    public UserResponse createManagedUser(CreateManagedUserRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        if (request.getRole() != Role.ADMIN
                && request.getRole() != Role.TECHNICIAN
                && request.getRole() != Role.USER) {
            throw new BadRequestException("Admins can only create USER, ADMIN, or TECHNICIAN accounts directly");
        }

        User user = User.builder()
                .name(request.getName())
                .email(email)
                .username(null)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .userType(resolveManagedUserType(request.getRole(), request.getUserType()))
                .authProvider(AuthProvider.LOCAL)
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .isActive(true)
                .emailVerified(true)
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();

        User savedUser = userRepository.save(user);
        savedUser = userIdentityService.ensureUserIdAndSave(savedUser);
        return mapToUserResponse(savedUser);
    }

    @Override
    public UserResponse updateManagedUser(String userId, UpdateManagedUserRequest request) {
        User user = userIdentityService.findByPublicUserId(userId);
        user = userIdentityService.ensureUserIdAndSave(user);
        User authenticatedUser = getAuthenticatedUser();

        if (request.getName() != null) {
            user.setName(request.getName().trim());
        }

        if (request.getEmail() != null) {
            String email = request.getEmail().trim().toLowerCase();

            if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
                throw new BadRequestException("Email is already registered");
            }

            user.setEmail(email);
        }

        if (request.getPhoneNumber() != null) {
            String phoneNumber = request.getPhoneNumber().trim();
            user.setPhoneNumber(phoneNumber.isEmpty() ? null : phoneNumber);
        }

        if (request.getDepartment() != null) {
            String department = request.getDepartment().trim();
            user.setDepartment(department.isEmpty() ? null : department);
        }

        if (request.getPictureUrl() != null) {
            String pictureUrl = request.getPictureUrl().trim();
            user.setPictureUrl(pictureUrl.isEmpty() ? null : pictureUrl);
        }

        if (request.getUserType() != null) {
            if (user.getRole() != Role.USER) {
                throw new BadRequestException("Only user accounts can have student or lecturer user types");
            }

            if (request.getUserType() != UserType.STUDENT && request.getUserType() != UserType.LECTURER) {
                throw new BadRequestException("User type must be STUDENT or LECTURER");
            }

            user.setUserType(request.getUserType());
        }

        if (request.getApprovalStatus() != null) {
            user.setApprovalStatus(request.getApprovalStatus());
        }

        if (request.getIsActive() != null) {
            if (user.getRole() == Role.ADMIN
                    && authenticatedUser.getUsername() != null
                    && authenticatedUser.getUsername().equals(user.getUsername())
                    && Boolean.FALSE.equals(request.getIsActive())) {
                throw new BadRequestException("You cannot deactivate your own admin account here");
            }
            user.setIsActive(request.getIsActive());
        }

        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    @Override
    public UserResponse updateUserRole(String userId, UpdateUserRoleRequest request) {
        User user = userIdentityService.findByPublicUserId(userId);
        user = userIdentityService.ensureUserIdAndSave(user);

        if (request.getRole() != Role.USER) {
            throw new BadRequestException("Use managed account creation for ADMIN and TECHNICIAN accounts");
        }

        user.setRole(request.getRole());

        if (request.getUserType() == null) {
            throw new BadRequestException("User type is required when approving a USER account");
        }

        if (request.getUserType() != UserType.STUDENT && request.getUserType() != UserType.LECTURER) {
            throw new BadRequestException("User type must be STUDENT or LECTURER when role is USER");
        }

        user.setUserType(request.getUserType());

        user.setApprovalStatus(ApprovalStatus.APPROVED);
        user.setRequestedRole(null);
        user.setRequestedUserType(null);

        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }

    @Override
    public UserResponse updateApprovalStatus(String userId, UpdateApprovalStatusRequest request) {
        User user = userIdentityService.findByPublicUserId(userId);
        user = userIdentityService.ensureUserIdAndSave(user);

        user.setApprovalStatus(request.getApprovalStatus());

        if (request.getApprovalStatus() == ApprovalStatus.APPROVED) {
            UserType approvedUserType = user.getRequestedUserType() != null ? user.getRequestedUserType() : user.getUserType();
            notificationService.createNotification(
                    user.getId(),
                    "Access Approved",
                    "Your " + approvedUserType + " access request has been approved by admin.",
                    NotificationType.ACCESS_APPROVED,
                    user.getId()
            );
        }

        if (request.getApprovalStatus() == ApprovalStatus.REJECTED) {
            notificationService.createNotification(
                    user.getId(),
                    "Access Rejected",
                    "Your access request was reviewed and rejected by admin.",
                    NotificationType.ACCESS_REJECTED,
                    user.getId()
            );
            user.setRequestedRole(null);
            user.setRequestedUserType(null);
        }

        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    @Override
    public UserResponse updateUserStatus(String userId, UpdateUserStatusRequest request) {
        User user = userIdentityService.findByPublicUserId(userId);
        user = userIdentityService.ensureUserIdAndSave(user);

        user.setIsActive(request.getIsActive());

        if (Boolean.TRUE.equals(request.getIsActive())) {
            notificationService.createNotification(
                    user.getId(),
                    "Account Activated",
                    "Your campus account has been activated.",
                    NotificationType.ACCOUNT_ACTIVATED,
                    user.getId()
            );
        } else {
            notificationService.createNotification(
                    user.getId(),
                    "Account Deactivated",
                    "Your campus account has been deactivated by admin.",
                    NotificationType.ACCOUNT_DEACTIVATED,
                    user.getId()
            );
        }

        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }

    @Override
    public void deleteUser(String userId) {
        User user = userIdentityService.findByPublicUserId(userId);
        user = userIdentityService.ensureUserIdAndSave(user);
        User authenticatedUser = getAuthenticatedUser();

        if (user.getRole() == Role.ADMIN) {
            if (authenticatedUser.getUsername() != null
                    && authenticatedUser.getUsername().equals(user.getUsername())) {
                throw new BadRequestException("You cannot delete your own admin account here");
            }

            long adminCount = userRepository.findAll()
                    .stream()
                    .filter(existingUser -> existingUser.getRole() == Role.ADMIN)
                    .count();

            if (adminCount <= 1) {
                throw new BadRequestException("At least one admin account must remain in the system");
            }
        }

        notificationRepository.deleteAllByUserId(user.getId());
        userRepository.delete(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getUsername())
                .internalId(user.getId())
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
                .approvalStatus(user.getApprovalStatus())
                .requestedRole(user.getRequestedRole())
                .requestedUserType(user.getRequestedUserType())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private AuthResponse buildAuthResponse(User user, boolean includeToken) {
        String token = includeToken
                ? jwtService.generateToken(user.getEmail(), user.getUsername(), user.getRole().name())
                : null;

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUsername())
                .internalUserId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .userType(user.getUserType())
                .authProvider(user.getAuthProvider())
                .pictureUrl(user.getPictureUrl())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .profileCompleted(user.getRole() != Role.USER || user.getUserType() != null)
                .approvalStatus(user.getApprovalStatus())
                .requestedRole(user.getRequestedRole())
                .requestedUserType(user.getRequestedUserType())
                .build();
    }

    private UserType mapRegistrationTypeToUserType(RegistrationType registrationType) {
        return switch (registrationType) {
            case NORMAL_USER -> null;
            case STUDENT -> UserType.STUDENT;
            case LECTURER -> UserType.LECTURER;
        };
    }

    private UserType resolveManagedUserType(Role role, UserType userType) {
        if (role == Role.ADMIN || role == Role.TECHNICIAN) {
            return null;
        }

        if (userType == null) {
            throw new BadRequestException("User type is required when creating a USER account");
        }

        return userType;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("User not authenticated");
        }

        return user;
    }
}
