package com.smcsystem.smart_campus_system.security;

import com.smcsystem.smart_campus_system.enums.AuthProvider;
import com.smcsystem.smart_campus_system.enums.ApprovalStatus;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.UserType;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.UserRepository;
import com.smcsystem.smart_campus_system.service.UserIdentityService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserIdentityService userIdentityService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();

            boolean isStudentGoogleAccount =
                    user.getRole() == Role.USER && user.getUserType() == UserType.STUDENT;

            if (!isStudentGoogleAccount) {
                response.sendRedirect(frontendUrl + "/?error=google_student_only");
                return;
            }

            user.setName(name);
            user.setPictureUrl(picture);
            user.setLastLoginAt(LocalDateTime.now());
        } else {
            user = User.builder()
                    .name(name)
                    .email(email)
                    .username(null)
                    .password(null)
                    .role(Role.USER)
                    .userType(UserType.STUDENT)
                    .authProvider(AuthProvider.GOOGLE)
                    .pictureUrl(picture)
                    .isActive(true)
                    .emailVerified(true)
                    .approvalStatus(ApprovalStatus.PENDING)
                    .lastLoginAt(LocalDateTime.now())
                    .build();
        }

        User savedUser = userRepository.save(user);
        savedUser = userIdentityService.ensureUserIdAndSave(savedUser);

        String token = jwtService.generateToken(
                savedUser.getEmail(),
                savedUser.getUsername(),
                savedUser.getRole().name()
        );

        boolean profileCompleted = savedUser.getUserType() != null;

        String redirectUrl = frontendUrl
                + "/oauth-success?token=" + token
                + "&profileCompleted=" + profileCompleted;

        response.sendRedirect(redirectUrl);
    }
}
