package com.dariusfirstproject.gura_neza.user;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    private String currentPassword;   // required only when changing password
    private String newPassword;       // optional — omit to keep existing password
}
