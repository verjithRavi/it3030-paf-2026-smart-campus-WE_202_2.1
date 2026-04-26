package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.ResourceType;
import com.smcsystem.smart_campus_system.dto.request.ResourceRequest;
import com.smcsystem.smart_campus_system.dto.response.ResourceResponse;

import java.util.List;

public interface ResourceService {
    
    ResourceResponse createResource(ResourceRequest request, String createdBy);
    
    ResourceResponse updateResource(String id, ResourceRequest request, String updatedBy);
    
    void deleteResource(String id);
    
    ResourceResponse getResourceById(String id);
    
    ResourceResponse getResourceByResourceId(String resourceId);
    
    List<ResourceResponse> getAllResources();
    
    List<ResourceResponse> getResourcesByType(ResourceType type);
    
    List<ResourceResponse> getResourcesByStatus(ResourceStatus status);
    
    List<ResourceResponse> getResourcesByDepartment(String department);
    
    ResourceResponse updateResourceStatus(String id, ResourceStatus status, String updatedBy);
    
    ResourceResponse toggleResourceActive(String id, String updatedBy);
}
