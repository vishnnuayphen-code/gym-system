package com.gymsystem.controller;

import com.gymsystem.dto.AssignPermissionRequest;
import com.gymsystem.entity.Permission;
import com.gymsystem.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }

    @GetMapping("/role/{roleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<Set<Permission>> getPermissionsByRole(@PathVariable("roleId") Long roleId) {
        return ResponseEntity.ok(permissionService.getPermissionsByRole(roleId));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<String> assignPermission(@RequestBody AssignPermissionRequest request) {
        permissionService.assignPermissionToRole(request.getRoleId(), request.getPermissionId());
        return ResponseEntity.ok("Permission assigned successfully");
    }

    @DeleteMapping("/remove")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<String> removePermission(@RequestBody AssignPermissionRequest request) {
        permissionService.removePermissionFromRole(request.getRoleId(), request.getPermissionId());
        return ResponseEntity.ok("Permission removed successfully");
    }
}
