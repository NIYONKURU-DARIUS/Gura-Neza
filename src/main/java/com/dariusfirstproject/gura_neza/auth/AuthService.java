package com.dariusfirstproject.gura_neza.auth;

import com.dariusfirstproject.gura_neza.email.EmailService;
import com.dariusfirstproject.gura_neza.security.JwtService;
import com.dariusfirstproject.gura_neza.user.Role;
import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import com.dariusfirstproject.gura_neza.wallet.Wallet;
import com.dariusfirstproject.gura_neza.wallet.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final WalletRepository walletRepository;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {

        // 1. Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // 2. Hash the password
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // 3. Build user with enabled=false and a verification token
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(hashedPassword)
                .role(Role.USER)
                .enabled(false)
                .verificationToken(UUID.randomUUID().toString())
                .build();

        // 4. Save user
        userRepository.save(user);

        // 5. Create wallet for user
        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO)
                .build();
        walletRepository.save(wallet);

        // 6. Send verification email
        String verificationLink = "http://localhost:8086/api/auth/verify?token="
                + user.getVerificationToken();
        emailService.sendVerificationEmail(user.getEmail(), user.getName(), verificationLink);

        // 7. Return message instead of token
        return AuthResponse.builder()
                .token(null)
                .message("Registration successful! Please check your email to verify your account.")
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        // 1. Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // 3. Check if email is verified
        if (!user.isEnabled()) {
            throw new RuntimeException("Please verify your email before logging in");
        }

        // 4. Generate token
        String token = jwtService.generateToken(user);

        // 5. Return response
        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId().toString())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .build();
    }

    public String verifyEmail(String token) {

        // 1. Find user by verification token
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        // 2. Enable the user
        user.setEnabled(true);

        // 3. Clear the token so it can't be used again
        user.setVerificationToken(null);

        // 4. Save
        userRepository.save(user);

        return "Email verified successfully! You can now login.";
    }
}