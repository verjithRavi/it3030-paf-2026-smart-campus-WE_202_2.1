package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.response.NotificationResponse;
import com.smcsystem.smart_campus_system.dto.response.UnreadCountResponse;
import com.smcsystem.smart_campus_system.enums.NotificationType;
import com.smcsystem.smart_campus_system.exception.ResourceNotFoundException;
import com.smcsystem.smart_campus_system.exception.UnauthorizedException;
import com.smcsystem.smart_campus_system.model.Notification;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.NotificationRepository;
import com.smcsystem.smart_campus_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        if (authentication.getPrincipal() instanceof User user) {
            return user;
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    private String buildTimeAgo(LocalDateTime createdAt) {
        if (createdAt == null) return "";
        long seconds = ChronoUnit.SECONDS.between(createdAt, LocalDateTime.now());
        if (seconds < 60) return "just now";
        long minutes = ChronoUnit.MINUTES.between(createdAt, LocalDateTime.now());
        if (minutes < 60) return minutes + " min ago";
        long hours = ChronoUnit.HOURS.between(createdAt, LocalDateTime.now());
        if (hours < 24) return hours + " hr ago";
        long days = ChronoUnit.DAYS.between(createdAt, LocalDateTime.now());
        if (days < 7) return days + " days ago";
        return createdAt.toLocalDate().toString();
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType() != null ? n.getType().name() : null)
                .isRead(n.isRead())
                .relatedEntityId(n.getRelatedEntityId())
                .createdAt(n.getCreatedAt())
                .timeAgo(buildTimeAgo(n.getCreatedAt()))
                .build();
    }

    @Override
    public void createNotification(String userId, String title, String message, NotificationType type, String relatedEntityId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .relatedEntityId(relatedEntityId)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponse> getNotificationsForCurrentUser() {
        User user = getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public UnreadCountResponse getUnreadCount() {
        User user = getCurrentUser();
        long count = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        return UnreadCountResponse.builder().count(count).build();
    }

    @Override
    public void markAsRead(String notificationId) {
        User user = getCurrentUser();
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getUserId().equals(user.getId())) throw new UnauthorizedException("Access denied");
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Override
    public void markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public void deleteNotification(String notificationId) {
        User user = getCurrentUser();
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getUserId().equals(user.getId())) throw new UnauthorizedException("Access denied");
        notificationRepository.delete(n);
    }
}
