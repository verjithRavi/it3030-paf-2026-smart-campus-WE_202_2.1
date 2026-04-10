package com.smcsystem.smart_campus_system.dto.request;

import com.smcsystem.smart_campus_system.enums.UserType;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Email(message = "Invalid email format")
    private String email;

    private String name;

    private String phoneNumber;

    private String department;

    private String pictureUrl;

    private String currentPassword;

    private String newPassword;

    private String confirmNewPassword;

    private UserType requestedUserType;
}
