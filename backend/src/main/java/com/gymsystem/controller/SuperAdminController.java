package com.gymsystem.controller;

import com.gymsystem.dto.ApiResponse;
import com.gymsystem.dto.CreateTenantRequest;
import com.gymsystem.dto.UpdateGymRequest;
import com.gymsystem.dto.GymDetailsResponse;
import com.gymsystem.dto.CreateAdminRequest;
import com.gymsystem.dto.UpdateAdminRequest;
import com.gymsystem.entity.Gym;
import com.gymsystem.service.SuperAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
public class SuperAdminController {

    @Autowired
    private SuperAdminService superAdminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Dashboard stats retrieved", superAdminService.getDashboardStats()));
    }

    @GetMapping("/gyms")
    public ResponseEntity<ApiResponse<List<Gym>>> getAllGyms() {
        return ResponseEntity.ok(ApiResponse.ok("Gyms retrieved", superAdminService.getAllGyms()));
    }

    @PostMapping("/gyms/simple")
    public ResponseEntity<ApiResponse<Gym>> createGymOnly(@RequestBody UpdateGymRequest request) {
        Gym gym = superAdminService.createGymOnly(request);
        return ResponseEntity.ok(ApiResponse.ok("Gym created successfully", gym));
    }

    @PostMapping("/gyms")
    public ResponseEntity<ApiResponse<Gym>> createTenant(@RequestBody CreateTenantRequest request) {
        Gym gym = superAdminService.createTenant(request);
        return ResponseEntity.ok(ApiResponse.ok("Tenant and owner created successfully", gym));
    }

    @PatchMapping("/gyms/{gymId}/toggle-status")
    public ResponseEntity<ApiResponse<Gym>> toggleGymStatus(@PathVariable Long gymId) {
        Gym gym = superAdminService.toggleGymStatus(gymId);
        return ResponseEntity.ok(ApiResponse.ok("Gym status updated", gym));
    }

    @PutMapping("/gyms/{gymId}")
    public ResponseEntity<ApiResponse<Gym>> updateGym(@PathVariable Long gymId, @RequestBody UpdateGymRequest request) {
        Gym gym = superAdminService.updateGym(gymId, request);
        return ResponseEntity.ok(ApiResponse.ok("Gym updated successfully", gym));
    }

    @GetMapping("/gyms/{gymId}/details")
    public ResponseEntity<ApiResponse<GymDetailsResponse>> getGymDetails(@PathVariable Long gymId) {
        return ResponseEntity.ok(ApiResponse.ok("Gym details retrieved", superAdminService.getGymDetails(gymId)));
    }

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<List<com.gymsystem.entity.User>>> getAllMembers() {
        return ResponseEntity.ok(ApiResponse.ok("Members retrieved", superAdminService.getAllMembers()));
    }

    @GetMapping("/coaches")
    public ResponseEntity<ApiResponse<List<com.gymsystem.entity.User>>> getAllCoaches() {
        return ResponseEntity.ok(ApiResponse.ok("Coaches retrieved", superAdminService.getAllCoaches()));
    }

    @GetMapping("/admins")
    public ResponseEntity<ApiResponse<List<com.gymsystem.entity.User>>> getAllAdmins() {
        return ResponseEntity.ok(ApiResponse.ok("Admins retrieved", superAdminService.getAllAdmins()));
    }

    @PostMapping("/admins")
    public ResponseEntity<ApiResponse<com.gymsystem.entity.User>> createAdmin(@RequestBody CreateAdminRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Admin created", superAdminService.createAdmin(request)));
    }

    @PutMapping("/admins/{id}")
    public ResponseEntity<ApiResponse<com.gymsystem.entity.User>> updateAdmin(@PathVariable Long id, @RequestBody UpdateAdminRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Admin updated", superAdminService.updateAdmin(id, request)));
    }

    @PatchMapping("/admins/{id}/toggle-status")
    public ResponseEntity<ApiResponse<com.gymsystem.entity.User>> toggleAdminStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Admin status updated", superAdminService.toggleAdminStatus(id)));
    }

    @PatchMapping("/admins/{id}/reset-password")
    public ResponseEntity<ApiResponse<com.gymsystem.entity.User>> resetAdminPassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(ApiResponse.ok("Password reset", superAdminService.resetAdminPassword(id, request.get("newPassword"))));
    }
}
