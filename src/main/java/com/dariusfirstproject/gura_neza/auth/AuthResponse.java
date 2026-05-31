package com.dariusfirstproject.gura_neza.auth;

import com.dariusfirstproject.gura_neza.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private UserDto user;

    @Data
    @Builder
    public static class UserDto {
        private String id;
        private String name;
        private String email;
        private Role role;
    }
}
