package com.smcsystem.smart_campus_system.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {
    
    @NotBlank(message = "Resource ID is required")
    private String resourceId;
    
    @NotNull(message = "Start date is required")
    private String startDate;
    
    @NotNull(message = "End date is required")
    private String endDate;
    
    @NotBlank(message = "Purpose is required")
    private String purpose;
    
    private Integer attendees;
    private String userId;
}
