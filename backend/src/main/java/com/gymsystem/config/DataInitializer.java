package com.gymsystem.config;

import com.gymsystem.entity.Role;
import com.gymsystem.entity.User;
import com.gymsystem.repository.RoleRepository;
import com.gymsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedSuperAdmin();
    }

    private void seedSuperAdmin() {
        // 1. Ensure SUPER_ADMIN role exists
        Role superAdminRole = roleRepository.findByName("SUPER_ADMIN")
                .orElseGet(() -> {
                    Role role = new Role("SUPER_ADMIN");
                    return roleRepository.save(role);
                });

        // 2. Ensure default super admin user exists
        String superAdminEmail = "superadmin@gymsystem.com";
        Optional<User> existingUser = userRepository.findByEmail(superAdminEmail);

        if (existingUser.isEmpty()) {
            User superAdmin = new User();
            superAdmin.setName("System Super Admin");
            superAdmin.setEmail(superAdminEmail);
            superAdmin.setPasswordHash(passwordEncoder.encode("superadmin123")); // Default password
            superAdmin.setRole(superAdminRole);
            // Super Admin doesn't necessarily belong to a specific gym tenant, but let's leave it null.
            // Our User entity allows gym to be null if we don't set nullable=false on the @JoinColumn, but let's check.
            userRepository.save(superAdmin);
            System.out.println("Default SUPER_ADMIN seeded: " + superAdminEmail + " / superadmin123");
        }
    }
}
