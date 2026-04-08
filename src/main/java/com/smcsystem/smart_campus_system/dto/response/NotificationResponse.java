package com.smcsystem.smart_campus_system.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private String id;
    private String userId;
    private String title;
    private String message;
    private String type;
    private boolean isRead;
    private String relatedEntityId;
    private LocalDateTime createdAt;
    private String timeAgo;
}
