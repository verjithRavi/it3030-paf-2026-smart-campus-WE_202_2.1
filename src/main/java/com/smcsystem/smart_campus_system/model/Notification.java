package com.smcsystem.smart_campus_system.model;

import com.smcsystem.smart_campus_system.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;

    private String message;

    private NotificationType type;

    @Builder.Default
    private boolean isRead = false;

    private String relatedEntityId;

    @CreatedDate
    private LocalDateTime createdAt;
}
