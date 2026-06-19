package com.gymsystem.controller;

import com.gymsystem.dto.ApiResponse;
import com.gymsystem.dto.CreateAvailabilityRequest;
import com.gymsystem.entity.CoachAvailability;
import com.gymsystem.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coach-availability")
public class CoachAvailabilityController {

    private final SessionService sessionService;

    public CoachAvailabilityController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('manage_availability') or hasAnyRole('OWNER', 'COACH', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<CoachAvailability>>> createAvailability(
            @Valid @RequestBody CreateAvailabilityRequest request
    ) {
        List<CoachAvailability> availabilities = sessionService.createAvailability(request);
        return ResponseEntity.ok(ApiResponse.ok("Availability created successfully", availabilities));
    }

    @GetMapping("/{coachId}")
    public ResponseEntity<ApiResponse<List<CoachAvailability>>> getCoachAvailability(@PathVariable("coachId") Long coachId) {
        List<CoachAvailability> availabilities = sessionService.getCoachAvailability(coachId);
        return ResponseEntity.ok(ApiResponse.ok("Coach availability retrieved", availabilities));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('manage_availability') or hasAnyRole('OWNER', 'COACH', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(@PathVariable("id") Long id) {
        sessionService.deleteAvailability(id);
        return ResponseEntity.ok(ApiResponse.ok("Availability deleted successfully", null));
    }

    @DeleteMapping("/group/{groupId}")
    @PreAuthorize("hasAnyAuthority('manage_availability') or hasAnyRole('OWNER', 'COACH', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAvailabilityGroup(@PathVariable("groupId") String groupId) {
        sessionService.deleteAvailabilityGroup(groupId);
        return ResponseEntity.ok(ApiResponse.ok("Availability group deleted successfully", null));
    }
}
