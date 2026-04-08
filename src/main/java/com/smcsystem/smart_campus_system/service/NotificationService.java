package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.dto.response.NotificationResponse;
import com.smcsystem.smart_campus_system.dto.response.UnreadCountResponse;
import com.smcsystem.smart_campus_system.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    void createNotification(String userId, String title, String message, NotificationType type, String relatedEntityId);
    List<NotificationResponse> getNotificationsForCurrentUser();
    UnreadCountResponse getUnreadCount();
    void markAsRead(String notificationId);
    void markAllAsRead();
    void deleteNotification(String notificationId);
}
