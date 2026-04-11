package com.smcsystem.smart_campus_system.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingNotificationResponse {
    
    private String message;
    private String bookingId;
    private String resourceName;
    private String status;
    private String timestamp;
    private String userId;
    private String userName;
}
