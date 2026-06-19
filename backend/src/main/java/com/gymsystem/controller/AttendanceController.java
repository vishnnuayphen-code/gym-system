package com.gymsystem.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymsystem.dto.AttendanceDTO;
import com.gymsystem.dto.AttendanceUpdateRequest;
import com.gymsystem.entity.AttendanceStatus;
import com.gymsystem.entity.CheckInMethod;
import com.gymsystem.entity.User;
import com.gymsystem.service.AttendanceService;
import com.gymsystem.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AuthService authService;

    private Long getGymIdFromRequest(HttpServletRequest request) {
        Object gymIdObj = request.getAttribute("gymId");
        if (gymIdObj == null) return null;
        if (gymIdObj instanceof Integer i) return i.longValue();
        if (gymIdObj instanceof Long l) return l;
        return Long.valueOf(gymIdObj.toString());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'COACH', 'TRAINEE')")
    public ResponseEntity<AttendanceDTO> markAttendance(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request
    ) {
        User currentUser = authService.getCurrentUser();
        
        Long traineeId = Long.valueOf(payload.get("traineeId").toString());
        LocalDate date = LocalDate.parse(payload.get("attendanceDate").toString());
        AttendanceStatus status = AttendanceStatus.valueOf(payload.get("status").toString());
        String notes = payload.getOrDefault("notes", "").toString();
        
        LocalDateTime checkInTime = null;
        if (payload.get("checkInTime") != null) {
            String timeStr = payload.get("checkInTime").toString();
            // Handle both full ISO and simple HH:mm if needed, but mobile sends HH:mm or full ISO
            if (timeStr.length() > 5) {
                checkInTime = LocalDateTime.parse(timeStr);
            } else {
                checkInTime = LocalDateTime.of(date, java.time.LocalTime.parse(timeStr));
            }
        }
        
        LocalDateTime checkOutTime = null;
        if (payload.get("checkOutTime") != null) {
            String timeStr = payload.get("checkOutTime").toString();
            if (timeStr.length() > 5) {
                checkOutTime = LocalDateTime.parse(timeStr);
            } else {
                checkOutTime = LocalDateTime.of(date, java.time.LocalTime.parse(timeStr));
            }
        }
        
        CheckInMethod method = payload.get("checkInMethod") != null 
            ? CheckInMethod.valueOf(payload.get("checkInMethod").toString()) 
            : CheckInMethod.MANUAL;
            
        Double temp = payload.get("temperatureReading") != null 
            ? Double.valueOf(payload.get("temperatureReading").toString()) 
            : null;
            
        Boolean mask = payload.get("isMaskWorn") != null 
            ? Boolean.valueOf(payload.get("isMaskWorn").toString()) 
            : null;

        AttendanceDTO attendance = attendanceService.markAttendance(
            traineeId, 
            currentUser.getId(), 
            date, 
            status, 
            notes,
            checkInTime,
            checkOutTime,
            method,
            temp,
            mask
        );
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/trainee/{traineeId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'COACH', 'TRAINEE')")
    public ResponseEntity<List<AttendanceDTO>> getTraineeAttendance(@PathVariable("traineeId") Long traineeId) {
        return ResponseEntity.ok(attendanceService.getTraineeAttendance(traineeId));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'COACH')")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceForDate(
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            HttpServletRequest request
    ) {
        Long gymId = getGymIdFromRequest(request);
        return ResponseEntity.ok(attendanceService.getAttendanceForDateInGym(gymId, date));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'COACH')")
    public ResponseEntity<AttendanceDTO> updateAttendance(
            @PathVariable("id") Long id,
            @RequestBody AttendanceUpdateRequest request
    ) {
        return ResponseEntity.ok(attendanceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'COACH')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable("id") Long id) {
        attendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
