package com.dariusfirstproject.gura_neza.config;

import com.dariusfirstproject.gura_neza.user.Role;
import com.dariusfirstproject.gura_neza.user.User;
import com.dariusfirstproject.gura_neza.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findAll().stream().noneMatch(u -> u.getRole() == Role.ADMIN)) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@gura.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            
            System.out.println("Default admin created: admin@gura.com / Admin@123");
        }
    }
}
