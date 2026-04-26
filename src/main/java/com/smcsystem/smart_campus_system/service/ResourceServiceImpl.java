package com.smcsystem.smart_campus_system.service;

import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.ResourceType;
import com.smcsystem.smart_campus_system.dto.request.ResourceRequest;
import com.smcsystem.smart_campus_system.dto.response.ResourceResponse;
import com.smcsystem.smart_campus_system.exception.ResourceNotFoundException;
import com.smcsystem.smart_campus_system.model.Resource;
import com.smcsystem.smart_campus_system.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public ResourceResponse createResource(ResourceRequest request, String createdBy) {
        String resourceId = generateResourceId(request.getType());

        Resource resource = Resource.builder()
                .resourceId(resourceId)
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .status(ResourceStatus.AVAILABLE)
                .specifications(request.getSpecifications())
                .department(request.getDepartment())
                .equipmentCategory(request.getEquipmentCategory())
                .imageUrl(request.getImageUrl())
                .brand(request.getBrand())
                .model(request.getModel())
                .serialNumber(request.getSerialNumber())
                .floorNumber(request.getFloorNumber())
                .buildingName(request.getBuildingName())
                .hasProjector(request.isHasProjector())
                .hasComputers(request.isHasComputers())
                .hasWhiteboard(request.isHasWhiteboard())
                .hasWifi(request.isHasWifi())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(createdBy)
                .updatedBy(createdBy)
                .active(true)
                .build();

        Resource savedResource = resourceRepository.save(resource);
        return convertToResponse(savedResource);
    }

    @Override
    public ResourceResponse updateResource(String id, ResourceRequest request, String updatedBy) {
        Resource resource = getResourceByIdOrThrow(id);
        
        resource.setName(request.getName());
        resource.setDescription(request.getDescription());
        resource.setType(request.getType());
        resource.setLocation(request.getLocation());
        resource.setCapacity(request.getCapacity());
        resource.setSpecifications(request.getSpecifications());
        resource.setDepartment(request.getDepartment());
        resource.setEquipmentCategory(request.getEquipmentCategory());
        resource.setImageUrl(request.getImageUrl());
        resource.setBrand(request.getBrand());
        resource.setModel(request.getModel());
        resource.setSerialNumber(request.getSerialNumber());
        resource.setFloorNumber(request.getFloorNumber());
        resource.setBuildingName(request.getBuildingName());
        resource.setHasProjector(request.isHasProjector());
        resource.setHasComputers(request.isHasComputers());
        resource.setHasWhiteboard(request.isHasWhiteboard());
        resource.setHasWifi(request.isHasWifi());
        resource.setUpdatedAt(LocalDateTime.now());
        resource.setUpdatedBy(updatedBy);

        Resource savedResource = resourceRepository.save(resource);
        return convertToResponse(savedResource);
    }

    @Override
    public void deleteResource(String id) {
        Resource resource = getResourceByIdOrThrow(id);
        resource.setActive(false);
        resource.setUpdatedAt(LocalDateTime.now());
        resourceRepository.save(resource);
    }

    @Override
    public ResourceResponse getResourceById(String id) {
        Resource resource = getResourceByIdOrThrow(id);
        return convertToResponse(resource);
    }

    @Override
    public ResourceResponse getResourceByResourceId(String resourceId) {
        Resource resource = resourceRepository.findByResourceId(resourceId);
        if (resource == null) {
            throw new ResourceNotFoundException("Resource not found with resourceId: " + resourceId);
        }
        return convertToResponse(resource);
    }

    @Override
    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findByActive(true)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceResponse> getResourcesByType(ResourceType type) {
        return resourceRepository.findByTypeAndActive(type, true)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceResponse> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatusAndActive(status, true)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceResponse> getResourcesByDepartment(String department) {
        return resourceRepository.findByDepartmentAndActive(department, true)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponse updateResourceStatus(String id, ResourceStatus status, String updatedBy) {
        Resource resource = getResourceByIdOrThrow(id);
        resource.setStatus(status);
        resource.setUpdatedAt(LocalDateTime.now());
        resource.setUpdatedBy(updatedBy);
        
        Resource savedResource = resourceRepository.save(resource);
        return convertToResponse(savedResource);
    }

    @Override
    public ResourceResponse toggleResourceActive(String id, String updatedBy) {
        Resource resource = getResourceByIdOrThrow(id);
        resource.setActive(!resource.isActive());
        resource.setUpdatedAt(LocalDateTime.now());
        resource.setUpdatedBy(updatedBy);
        
        Resource savedResource = resourceRepository.save(resource);
        return convertToResponse(savedResource);
    }

    private Resource getResourceByIdOrThrow(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    private ResourceResponse convertToResponse(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .resourceId(resource.getResourceId())
                .name(resource.getName())
                .description(resource.getDescription())
                .type(resource.getType())
                .location(resource.getLocation())
                .capacity(resource.getCapacity())
                .status(resource.getStatus())
                .imageUrl(resource.getImageUrl())
                .specifications(resource.getSpecifications())
                .department(resource.getDepartment())
                .equipmentCategory(resource.getEquipmentCategory())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .active(resource.isActive())
                .brand(resource.getBrand())
                .model(resource.getModel())
                .serialNumber(resource.getSerialNumber())
                .floorNumber(resource.getFloorNumber())
                .buildingName(resource.getBuildingName())
                .hasProjector(resource.isHasProjector())
                .hasComputers(resource.isHasComputers())
                .hasWhiteboard(resource.isHasWhiteboard())
                .hasWifi(resource.isHasWifi())
                .build();
    }

    private String generateResourceId(ResourceType type) {
        String prefix;
        switch (type) {
            case LAB: prefix = "LAB"; break;
            case ROOM: prefix = "ROOM"; break;
            case LECTURE_HALL: prefix = "LH"; break;
            case EQUIPMENT: prefix = "EQ"; break;
            default: prefix = "RES";
        }
        
        // Generate unique ID by checking existing resources of this type
        long maxId = 0;
        List<Resource> existingResources = resourceRepository.findByTypeAndActive(type, true);
        for (Resource resource : existingResources) {
            if (resource.getResourceId() != null && resource.getResourceId().startsWith(prefix)) {
                try {
                    String numberPart = resource.getResourceId().substring(prefix.length());
                    long id = Long.parseLong(numberPart);
                    if (id > maxId) {
                        maxId = id;
                    }
                } catch (NumberFormatException e) {
                    // Ignore invalid formats
                }
            }
        }
        
        return prefix + String.format("%04d", maxId + 1);
    }
}
