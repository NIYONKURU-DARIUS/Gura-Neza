package com.dariusfirstproject.gura_neza.user;

import com.dariusfirstproject.gura_neza.wallet.Wallet;
import com.dariusfirstproject.gura_neza.wallet.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserController Unit Tests")
class UserControllerTest {

    @Mock private WalletRepository walletRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserController userController;

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

    // ── GET /me ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getCurrentUser: returns user response with wallet balance")
    void getCurrentUser_returnsUserResponse() {
        when(walletRepository.findByUser(mockUser)).thenReturn(Optional.of(mockWallet));

        ResponseEntity<UserResponse> response = userController.getCurrentUser(mockUser);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getEmail()).isEqualTo("alice@example.com");
        assertThat(response.getBody().getName()).isEqualTo("Alice");
        assertThat(response.getBody().getWalletBalance()).isEqualByComparingTo("250.00");
        assertThat(response.getBody().getRole()).isEqualTo(Role.USER);
    }

    @Test
    @DisplayName("getCurrentUser: returns zero balance when wallet not found")
    void getCurrentUser_noWallet_returnsZeroBalance() {
        when(walletRepository.findByUser(mockUser)).thenReturn(Optional.empty());

        ResponseEntity<UserResponse> response = userController.getCurrentUser(mockUser);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getWalletBalance()).isEqualByComparingTo("0.00");
    }

    // ── PUT /me ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateCurrentUser: updates name successfully")
    void updateCurrentUser_validName_updatesName() {
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(walletRepository.findByUser(any(User.class))).thenReturn(Optional.of(mockWallet));

        UserUpdateRequest request = new UserUpdateRequest();
        request.setName("Alice Updated");

        ResponseEntity<?> response = userController.updateCurrentUser(mockUser, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(userRepository).save(mockUser);
    }

    @Test
    @DisplayName("updateCurrentUser: returns 400 when current password is wrong")
    void updateCurrentUser_wrongCurrentPassword_returns400() {
        when(passwordEncoder.matches(eq("wrongpass"), anyString())).thenReturn(false);
        when(walletRepository.findByUser(any(User.class))).thenReturn(Optional.of(mockWallet));

        UserUpdateRequest request = new UserUpdateRequest();
        request.setCurrentPassword("wrongpass");
        request.setNewPassword("newpassword123");

        ResponseEntity<?> response = userController.updateCurrentUser(mockUser, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertThat(body.get("message")).contains("incorrect");
    }

    @Test
    @DisplayName("updateCurrentUser: returns 400 when new password is too short")
    void updateCurrentUser_shortNewPassword_returns400() {
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(walletRepository.findByUser(any(User.class))).thenReturn(Optional.of(mockWallet));

        UserUpdateRequest request = new UserUpdateRequest();
        request.setCurrentPassword("correctpass");
        request.setNewPassword("abc"); // shorter than 6 chars

        ResponseEntity<?> response = userController.updateCurrentUser(mockUser, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertThat(body.get("message")).contains("6 characters");
    }

    @Test
    @DisplayName("updateCurrentUser: updates password when current password is correct and new is valid")
    void updateCurrentUser_validPasswordChange_returns200() {
        when(passwordEncoder.matches(eq("correctpass"), anyString())).thenReturn(true);
        when(passwordEncoder.encode(eq("newpassword123"))).thenReturn("new_encoded");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(walletRepository.findByUser(any(User.class))).thenReturn(Optional.of(mockWallet));

        UserUpdateRequest request = new UserUpdateRequest();
        request.setCurrentPassword("correctpass");
        request.setNewPassword("newpassword123");

        ResponseEntity<?> response = userController.updateCurrentUser(mockUser, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(passwordEncoder).encode("newpassword123");
        verify(userRepository).save(mockUser);
    }

    // ── GET /users (admin) ───────────────────────────────────────────────────

    @Test
    @DisplayName("getAllUsers: returns list of all users with wallet balances")
    void getAllUsers_returnsList() {
        User anotherUser = User.builder()
                .id(2L).name("Bob").email("bob@example.com")
                .role(Role.USER).enabled(true).build();

        when(userRepository.findAll()).thenReturn(List.of(mockUser, anotherUser));
        when(walletRepository.findByUser(mockUser)).thenReturn(Optional.of(mockWallet));
        when(walletRepository.findByUser(anotherUser)).thenReturn(Optional.empty());

        ResponseEntity<List<UserResponse>> response = userController.getAllUsers();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody().get(0).getEmail()).isEqualTo("alice@example.com");
        assertThat(response.getBody().get(0).getWalletBalance()).isEqualByComparingTo("250.00");
        assertThat(response.getBody().get(1).getWalletBalance()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("getAllUsers: returns empty list when no users exist")
    void getAllUsers_emptyList() {
        when(userRepository.findAll()).thenReturn(List.of());

        ResponseEntity<List<UserResponse>> response = userController.getAllUsers();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty();
    }
}
