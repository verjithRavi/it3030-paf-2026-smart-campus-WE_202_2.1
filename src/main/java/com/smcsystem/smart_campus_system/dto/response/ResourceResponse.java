package com.smcsystem.smart_campus_system.dto.response;

import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    
    private String id;
    private String resourceId;
    private String name;
    private String description;
    private ResourceType type;
    private String location;
    private Integer capacity;
    private ResourceStatus status;
    private String imageUrl;
    private String specifications;
    private String department;
    private String equipmentCategory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;
    
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
