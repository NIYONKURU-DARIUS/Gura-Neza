package com.dariusfirstproject.gura_neza.config;

import com.dariusfirstproject.gura_neza.security.JwtAuthFilter;
import com.dariusfirstproject.gura_neza.security.JwtService;
import com.dariusfirstproject.gura_neza.security.UserDetailsServiceImpl;
import com.dariusfirstproject.gura_neza.user.Role;
import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import com.dariusfirstproject.gura_neza.wallet.Wallet;
import com.dariusfirstproject.gura_neza.wallet.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.math.BigDecimal;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        // WebSocket handshake endpoints must be open
                        .requestMatchers("/ws/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler((request, response, authentication) -> {
                            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
                            OAuth2User oAuth2User = oauthToken.getPrincipal();
                            String email = oAuth2User.getAttribute("email");
                            String name  = oAuth2User.getAttribute("name");

                            User user = userRepository.findByEmail(email).orElseGet(() -> {
                                User newUser = User.builder()
                                        .name(name)
                                        .email(email)
                                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                                        .role(Role.USER)
                                        .enabled(true)
                                        .build();
                                userRepository.save(newUser);

                                Wallet wallet = Wallet.builder()
                                        .user(newUser)
                                        .balance(BigDecimal.ZERO)
                                        .build();
                                walletRepository.save(wallet);
                                return newUser;
                            });

                            String token = jwtService.generateToken(user);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"token\":\"" + token + "\"}");
                        })
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}