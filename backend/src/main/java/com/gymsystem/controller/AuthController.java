package com.gymsystem.controller;

import com.gymsystem.dto.AuthResponse;
import com.gymsystem.dto.LoginRequest;
import com.gymsystem.dto.RegisterGymRequest;
import com.gymsystem.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register-super-admin")
    public ResponseEntity<AuthResponse> registerSuperAdmin(@Valid @RequestBody RegisterGymRequest request) {
        AuthResponse response = authService.registerSuperAdmin(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register-gym")
    public ResponseEntity<AuthResponse> registerGym(@Valid @RequestBody RegisterGymRequest request) {
        AuthResponse response = authService.registerGym(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/fcm-token")
    public ResponseEntity<?> updateFcmToken(@RequestBody String token) {
        authService.updateFcmToken(token);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile() {
        return ResponseEntity.ok(authService.getUserProfile());
    }
}
