package com.gymsystem.controller;

import com.gymsystem.dto.GymSettingsRequest;
import com.gymsystem.dto.GymResponse;
import com.gymsystem.service.GymService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gym")
public class GymController {

    private final GymService gymService;

    public GymController(GymService gymService) {
        this.gymService = gymService;
    }

    private Long getGymId(HttpServletRequest request) {
        Object gymId = request.getAttribute("gymId");
        if (gymId == null) return null;
        return Long.valueOf(gymId.toString());
    }

    @GetMapping("/settings")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'TRAINEE', 'COACH')")
    public ResponseEntity<GymResponse> getGymSettings(HttpServletRequest request) {
        Long gymId = getGymId(request);
        if (gymId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(gymService.getGymSettings(gymId));
    }

    @PutMapping("/settings")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<GymResponse> updateGymSettings(
            @RequestBody GymSettingsRequest request,
            HttpServletRequest servletRequest) {
        Long gymId = getGymId(servletRequest);
        if (gymId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(gymService.updateGymSettings(gymId, request));
    }
}
