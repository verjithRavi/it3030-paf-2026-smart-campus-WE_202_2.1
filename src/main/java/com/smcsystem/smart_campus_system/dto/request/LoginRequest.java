package com.smcsystem.smart_campus_system.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email or user ID is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;
}
