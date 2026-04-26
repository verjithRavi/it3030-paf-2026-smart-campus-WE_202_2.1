package com.smcsystem.smart_campus_system.model;

import com.smcsystem.smart_campus_system.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    
    @Id
    private String id;
    
    private String bookingId;
    private String resourceId;
    private String resourceName;
    private String userId;
    private String userName;
    private String userEmail;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String purpose;
    private Integer attendees;
    private BookingStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    private String approvedBy;
    private LocalDateTime approvedAt;
}
