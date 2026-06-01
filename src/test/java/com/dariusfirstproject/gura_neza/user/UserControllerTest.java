package com.dariusfirstproject.gura_neza.user;

import com.dariusfirstproject.gura_neza.wallet.Wallet;
import com.dariusfirstproject.gura_neza.wallet.WalletRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@DisplayName("UserController Web Layer Tests")
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean WalletRepository walletRepository;
    @MockBean UserRepository userRepository;
    @MockBean PasswordEncoder passwordEncoder;

    private User mockUser;
    private Wallet mockWallet;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .name("Alice")
                .email("alice@example.com")
                .password("encoded_password")
                .role(Role.USER)
                .enabled(true)
                .build();

        mockWallet = Wallet.builder()
                .id(1L)
                .user(mockUser)
                .balance(new BigDecimal("250.00"))
                .build();
    }

    // ── GET /api/users/me ────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /me: returns 200 with user profile for authenticated user")
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void getMe_authenticated_returns200() throws Exception {
        when(walletRepository.findByUser(any(User.class))).thenReturn(Optional.of(mockWallet));

        mockMvc.perform(get("/api/users/me")
                        .with(request -> {
                            request.setAttribute(
                                    "org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter",
                                    mockUser);
                            return request;
                        }))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /me: returns 401 when not authenticated")
    void getMe_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    // ── PUT /api/users/me ────────────────────────────────────────────────────

    @Test
    @DisplayName("PUT /me: returns 400 when current password is wrong")
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void updateMe_wrongCurrentPassword_returns400() throws Exception {
        when(passwordEncoder.matches(eq("wrongpass"), anyString())).thenReturn(false);
        when(walletRepository.findByUser(any())).thenReturn(Optional.of(mockWallet));

        UserUpdateRequest request = new UserUpdateRequest();
        request.setCurrentPassword("wrongpass");
        request.setNewPassword("newpassword123");

        mockMvc.perform(put("/api/users/me")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /me: returns 400 when new password is too short")
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void updateMe_shortNewPassword_returns400() throws Exception {
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(walletRepository.findByUser(any())).thenReturn(Optional.of(mockWallet));

        UserUpdateRequest request = new UserUpdateRequest();
        request.setCurrentPassword("correctpass");
        request.setNewPassword("abc"); // too short

        mockMvc.perform(put("/api/users/me")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ── GET /api/users (admin only) ──────────────────────────────────────────

    @Test
    @DisplayName("GET /users: returns 200 for ADMIN user")
    @WithMockUser(username = "admin@example.com", authorities = "ADMIN")
    void getAllUsers_asAdmin_returns200() throws Exception {
        when(userRepository.findAll()).thenReturn(List.of(mockUser));
        when(walletRepository.findByUser(any(User.class))).thenReturn(Optional.of(mockWallet));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("alice@example.com"));
    }

    @Test
    @DisplayName("GET /users: returns 403 for regular USER")
    @WithMockUser(username = "alice@example.com", roles = "USER")
    void getAllUsers_asUser_returns403() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }
}
