package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.ApprovalStatus;
import com.smcsystem.smart_campus_system.enums.UserType;
import lombok.Data;

@Data
public class UpdateManagedUserRequest {

    private String name;

    private String email;

    private String phoneNumber;

    private String department;

    private String pictureUrl;

    private UserType userType;

    private ApprovalStatus approvalStatus;

    private Boolean isActive;
}
