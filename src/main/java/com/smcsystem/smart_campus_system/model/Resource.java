package com.smcsystem.smart_campus_system.model;

import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "campus_resources")
public class Resource {
    
    @Id
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
    private String createdBy;
    private String updatedBy;
    private boolean active;
    
    // Equipment specific fields
    private String brand;
    private String model;
    private String serialNumber;
    
    // Room/Lab specific fields
    private Integer floorNumber;
    private String buildingName;
    private boolean hasProjector;
    private boolean hasComputers;
    private boolean hasWhiteboard;
    private boolean hasWifi;
}
