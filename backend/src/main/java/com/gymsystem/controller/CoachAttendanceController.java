package com.gymsystem.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymsystem.dto.CoachAttendanceRequest;
import com.gymsystem.dto.CoachAttendanceResponse;
import com.gymsystem.dto.CoachAttendanceUpdateRequest;
import com.gymsystem.service.CoachAttendanceService;

@RestController
@RequestMapping("/api/coach-attendance")
public class CoachAttendanceController {

    private final CoachAttendanceService coachAttendanceService;

    public CoachAttendanceController(CoachAttendanceService coachAttendanceService) {
        this.coachAttendanceService = coachAttendanceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'COACH')")
    public ResponseEntity<CoachAttendanceResponse> markAttendance(@RequestBody CoachAttendanceRequest request) {
        String markedBy = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(coachAttendanceService.markAttendance(request, markedBy));
    }

    @GetMapping("/coach/{coachId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'COACH')")
    public ResponseEntity<List<CoachAttendanceResponse>> getCoachAttendance(@PathVariable("coachId") Long coachId) {
        return ResponseEntity.ok(coachAttendanceService.getAttendanceByCoach(coachId));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'COACH')")
    public ResponseEntity<List<CoachAttendanceResponse>> getAttendanceByDate(
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(coachAttendanceService.getAttendanceByDate(date));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'COACH')")
    public ResponseEntity<CoachAttendanceResponse> updateCoachAttendance(
            @PathVariable("id") Long id,
            @RequestBody CoachAttendanceUpdateRequest request) {
        return ResponseEntity.ok(coachAttendanceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'COACH')")
    public ResponseEntity<Void> deleteCoachAttendance(@PathVariable("id") Long id) {
        coachAttendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
