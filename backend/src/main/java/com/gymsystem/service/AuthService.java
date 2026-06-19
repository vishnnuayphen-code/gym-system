package com.gymsystem.service;

import com.gymsystem.dto.AuthResponse;
import com.gymsystem.dto.LoginRequest;
import com.gymsystem.dto.RegisterGymRequest;
import com.gymsystem.entity.Gym;
import com.gymsystem.entity.Permission;
import com.gymsystem.entity.Role;
import com.gymsystem.entity.User;
import com.gymsystem.repository.GymRepository;
import com.gymsystem.repository.RoleRepository;
import com.gymsystem.repository.UserRepository;
import com.gymsystem.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final GymRepository gymRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, GymRepository gymRepository,
                       RoleRepository roleRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.gymRepository = gymRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    private List<String> getPermissionNames(Role role) {
        return role.getPermissions().stream()
                .map(Permission::getName)
                .collect(Collectors.toList());
    }

    public AuthResponse registerSuperAdmin(RegisterGymRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        Role superAdminRole = roleRepository.findByName("SUPER_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("SUPER_ADMIN")));

        User adminUser = new User(
                request.getOwnerName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                superAdminRole,
                null
        );
        adminUser = userRepository.save(adminUser);

        List<String> permissions = getPermissionNames(superAdminRole);
        String token = jwtUtil.generateToken(adminUser.getId(), adminUser.getName(), adminUser.getEmail(), superAdminRole.getName(), null, null, permissions);

        return new AuthResponse(token, adminUser.getId(), adminUser.getName(), adminUser.getEmail(), superAdminRole.getName(), null, null);
    }

    /**
     * Register Gym Owner - creates both user and gym
     */
    public AuthResponse registerGym(RegisterGymRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        Gym gym = new Gym(request.getGymName(), request.getAddress(), request.getPhone());
        gym = gymRepository.save(gym);

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ADMIN")));

        User adminUser = new User(
                request.getOwnerName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                adminRole,
                gym
        );
        adminUser = userRepository.save(adminUser);

        List<String> permissions = getPermissionNames(adminRole);
        String token = jwtUtil.generateToken(adminUser.getId(), adminUser.getName(), adminUser.getEmail(), adminRole.getName(), gym.getId(), null, permissions);

        return new AuthResponse(token, adminUser.getId(), adminUser.getName(), adminUser.getEmail(), adminRole.getName(), gym.getId(), null);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account has been deactivated.");
        }

        List<String> permissions = getPermissionNames(user.getRole());
        Long gymId = user.getGym() != null ? user.getGym().getId() : null;
        String token = jwtUtil.generateToken(user.getId(), user.getName(), user.getEmail(), user.getRole().getName(), gymId, user.getProfilePhotoUrl(), permissions);

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().getName(), gymId, user.getProfilePhotoUrl());
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        String principal = authentication.getName();
        
        try {
            Long userId = Long.valueOf(principal);
            return userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        } catch (NumberFormatException e) {
            return userRepository.findByEmail(principal)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        }
    }

    public void updateFcmToken(String token) {
        User user = getCurrentUser();
        user.setFcmToken(token);
        userRepository.save(user);
    }

    public java.util.Map<String, Object> getUserProfile() {
        User user = getCurrentUser();
        java.util.Map<String, Object> profile = new java.util.HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().getName());
        profile.put("gymId", user.getGym() != null ? user.getGym().getId() : null);
        profile.put("gymName", user.getGym() != null ? user.getGym().getName() : null);
        profile.put("profilePhotoUrl", user.getProfilePhotoUrl());
        return profile;
    }
}
