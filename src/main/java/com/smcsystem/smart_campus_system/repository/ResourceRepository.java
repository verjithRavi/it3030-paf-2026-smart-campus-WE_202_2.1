package com.smcsystem.smart_campus_system.repository;

import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.ResourceType;
import com.smcsystem.smart_campus_system.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    
    List<Resource> findByTypeAndActive(ResourceType type, boolean active);
    
    List<Resource> findByStatusAndActive(ResourceStatus status, boolean active);
    
    List<Resource> findByDepartmentAndActive(String department, boolean active);
    
    List<Resource> findByActive(boolean active);
    
    Resource findByResourceId(String resourceId);
    
    boolean existsByResourceId(String resourceId);
}
