package com.gymsystem.controller;

import com.gymsystem.dto.ApiResponse;
import com.gymsystem.dto.analytics.SuperAdminAnalyticsDTO.*;
import com.gymsystem.service.SuperAdminAnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/super-admin/analytics")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminAnalyticsController {

    private final SuperAdminAnalyticsService analyticsService;

    public SuperAdminAnalyticsController(SuperAdminAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok("Success", analyticsService.getDashboardSummary(startDate, endDate)));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueAnalyticsResponse>> getRevenueAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok("Success", analyticsService.getRevenueAnalytics(startDate, endDate)));
    }

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<MemberAnalyticsResponse>> getMemberAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok("Success", analyticsService.getMemberAnalytics(startDate, endDate)));
    }

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<AttendanceAnalyticsResponse>> getAttendanceAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok("Success", analyticsService.getAttendanceAnalytics(startDate, endDate)));
    }

    @GetMapping("/coaches")
    public ResponseEntity<ApiResponse<CoachAnalyticsResponse>> getCoachAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok("Success", analyticsService.getCoachAnalytics(startDate, endDate)));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<SessionAnalyticsResponse>> getSessionAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok("Success", analyticsService.getSessionAnalytics(startDate, endDate)));
    }

    @GetMapping("/gyms")
    public ResponseEntity<ApiResponse<List<GymComparisonResponse>>> getGymComparison(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.ok("Success", analyticsService.getGymComparison(startDate, endDate)));
    }
}
