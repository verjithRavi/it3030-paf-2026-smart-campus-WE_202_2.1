package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ResourceRequest {
    
    @NotBlank(message = "Resource name is required")
    private String name;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Resource type is required")
    private ResourceType type;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @Positive(message = "Capacity must be positive")
    private Integer capacity;
    
    private String specifications;
    private String department;
    private String equipmentCategory;
    private String imageUrl;
    
    // Equipment specific
    private String brand;
    private String model;
    private String serialNumber;
    
    // Room/Lab specific
    private Integer floorNumber;
    private String buildingName;
    private boolean hasProjector;
    private boolean hasComputers;
    private boolean hasWhiteboard;
    private boolean hasWifi;
}
