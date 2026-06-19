package com.gymsystem.controller;

import com.gymsystem.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    private Long getGymIdFromRequest(jakarta.servlet.http.HttpServletRequest request) {
        Object gymIdObj = request.getAttribute("gymId");
        if (gymIdObj == null) return null;
        if (gymIdObj instanceof Integer) return ((Integer) gymIdObj).longValue();
        if (gymIdObj instanceof Long) return (Long) gymIdObj;
        return Long.valueOf(gymIdObj.toString());
    }

    @GetMapping("/owner")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getOwnerStats(jakarta.servlet.http.HttpServletRequest request) {
        Long gymId = getGymIdFromRequest(request);
        return ResponseEntity.ok(dashboardService.getOwnerStats(gymId));
    }

    @GetMapping("/coach/{coachId}")
    public ResponseEntity<Map<String, Object>> getCoachStats(@PathVariable("coachId") Long coachId) {
        return ResponseEntity.ok(dashboardService.getCoachStats(coachId));
    }

    @GetMapping("/trainee/{traineeId}")
    public ResponseEntity<Map<String, Object>> getTraineeStats(@PathVariable("traineeId") Long traineeId) {
        return ResponseEntity.ok(dashboardService.getTraineeStats(traineeId));
    }
}
