package com.gymsystem.controller;

import com.gymsystem.dto.*;
import com.gymsystem.entity.MembershipPlan;
import com.gymsystem.entity.Payment;
import com.gymsystem.entity.TraineeMembership;
import com.gymsystem.entity.User;
import com.gymsystem.service.AuthService;
import com.gymsystem.service.MembershipService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/memberships")
public class MembershipController {

    private final MembershipService membershipService;
    private final AuthService authService;

    public MembershipController(MembershipService membershipService, AuthService authService) {
        this.membershipService = membershipService;
        this.authService = authService;
    }

    private Long getGymId(HttpServletRequest request) {
        Object gymIdObj = request.getAttribute("gymId");
        if (gymIdObj == null) return null;
        if (gymIdObj instanceof Integer val) return val.longValue();
        if (gymIdObj instanceof Long val) return val;
        return Long.valueOf(gymIdObj.toString());
    }

    // ── Plans ────────────────────────────────────────────────────────────

    @PostMapping("/plans")
    @PreAuthorize("hasAuthority('manage_fees') or hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MembershipPlanResponse>> createPlan(
            @RequestBody CreateMembershipPlanRequest body,
            HttpServletRequest request) {

        Long gymId = getGymId(request);
        MembershipPlan plan = membershipService.createPlan(body, gymId);
        return ResponseEntity.ok(ApiResponse.ok("Membership plan created successfully", membershipService.getPlanResponseById(plan.getId())));
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<MembershipPlanResponse>>> getPlans(HttpServletRequest request) {
        Long gymId = getGymId(request);
        return ResponseEntity.ok(ApiResponse.ok("Plans retrieved", membershipService.getPlans(gymId)));
    }

    @GetMapping("/plans/{planId:[0-9]+}")
    public ResponseEntity<ApiResponse<MembershipPlanResponse>> getPlan(@PathVariable("planId") Long planId) {
        return ResponseEntity.ok(ApiResponse.ok("Plan retrieved", membershipService.getPlanResponseById(planId)));
    }

    @PutMapping("/plans/{planId:[0-9]+}")
    @PreAuthorize("hasAuthority('manage_fees') or hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MembershipPlanResponse>> updatePlan(
            @PathVariable("planId") Long planId,
            @RequestBody UpdateMembershipPlanRequest body) {
        membershipService.updatePlan(planId, body);
        return ResponseEntity.ok(ApiResponse.ok("Membership plan updated successfully", membershipService.getPlanResponseById(planId)));
    }

    // ── Assign ────────────────────────────────────────────────────────────

    @PostMapping("/assign")
    @PreAuthorize("hasAuthority('manage_fees') or hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'TRAINEE')")
    public ResponseEntity<ApiResponse<TraineeMembership>> assignMembership(
            @RequestBody AssignMembershipRequest body) {

        User currentUser = authService.getCurrentUser();
        boolean isTrainee = currentUser.getRole().getName().equals("TRAINEE");

        if (isTrainee && !body.getTraineeId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only assign membership to yourself");
        }

        TraineeMembership membership = membershipService.assignMembership(body);
        return ResponseEntity.ok(ApiResponse.ok("Membership assigned successfully", membership));
    }

    @GetMapping("/trainee/{traineeId:[0-9]+}")
    public ResponseEntity<ApiResponse<TraineeMembership>> getTraineeMembership(@PathVariable("traineeId") Long traineeId) {
        return ResponseEntity.ok(ApiResponse.ok("Membership retrieved",
                membershipService.getTraineeMembership(traineeId)));
    }

    @GetMapping("/trainee/{traineeId:[0-9]+}/all")
    public ResponseEntity<ApiResponse<List<TraineeMembership>>> getAllTraineeMemberships(@PathVariable("traineeId") Long traineeId) {
        return ResponseEntity.ok(ApiResponse.ok("Memberships retrieved",
                membershipService.getAllTraineeMemberships(traineeId)));
    }

    // ── Self-access (Trainee /me) ──────────────────────────────────────────

    @GetMapping("/me")
    @PreAuthorize("hasRole('TRAINEE')")
    public ResponseEntity<ApiResponse<TraineeMembership>> getMyMembership(Principal principal) {
        Long traineeId = Long.valueOf(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Membership retrieved",
                membershipService.getTraineeMembership(traineeId)));
    }

    @GetMapping("/me/payments")
    @PreAuthorize("hasRole('TRAINEE')")
    public ResponseEntity<ApiResponse<List<Payment>>> getMyPayments(Principal principal) {
        Long traineeId = Long.valueOf(principal.getName());
        return ResponseEntity.ok(ApiResponse.ok("Payment history retrieved",
                membershipService.getPaymentHistory(traineeId)));
    }

    // ── Payments ──────────────────────────────────────────────────────────

    @PostMapping("/payment")
    @PreAuthorize("hasAuthority('manage_fees') or hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'TRAINEE')")
    public ResponseEntity<ApiResponse<Payment>> recordPayment(@RequestBody RecordPaymentRequest body) {
        
        User currentUser = authService.getCurrentUser();
        boolean isTrainee = currentUser.getRole().getName().equals("TRAINEE");

        if (isTrainee) {
            TraineeMembership membership = membershipService.getTraineeMembershipById(body.getTraineeMembershipId());
            if (!membership.getTrainee().getId().equals(currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only record payments for your own membership");
            }
        }

        Payment payment = membershipService.recordPayment(body);
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded successfully", payment));
    }

    @GetMapping("/payments/recent")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Payment>>> getRecentPayments(HttpServletRequest request) {
        Long gymId = getGymId(request);
        return ResponseEntity.ok(ApiResponse.ok("Recent payments retrieved", membershipService.getRecentPayments(gymId)));
    }

    @GetMapping("/payments/{traineeId:[0-9]+}")
    public ResponseEntity<ApiResponse<List<Payment>>> getTraineePayments(@PathVariable("traineeId") Long traineeId) {
        return ResponseEntity.ok(ApiResponse.ok("Payments retrieved", membershipService.getPaymentHistory(traineeId)));
    }
    
    // ── Subscriber Reports ────────────────────────────────────────────────

    @GetMapping("/plans/{planId:[0-9]+}/subscribers")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER')")
    public ResponseEntity<List<PlanSubscriberResponse>> getPlanSubscribers(@PathVariable("planId") Long planId) {
        return ResponseEntity.ok(membershipService.getSubscribersByPlan(planId));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'ADMIN', 'OWNER')")
    public ResponseEntity<List<PlanSubscriberResponse>> getAllActiveMemberships() {
        return ResponseEntity.ok(membershipService.getAllActiveMemberships());
    }

    // ── Validation ────────────────────────────────────────────────────────

    @GetMapping("/validate/{traineeId:[0-9]+}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GYM_ADMIN', 'OWNER', 'ADMIN', 'TRAINEE')")
    public ResponseEntity<ApiResponse<Boolean>> validateMembership(@PathVariable("traineeId") Long traineeId) {
        
        User currentUser = authService.getCurrentUser();
        boolean isTrainee = currentUser.getRole().getName().equals("TRAINEE");

        if (isTrainee && !traineeId.equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only validate your own membership");
        }

        boolean active = membershipService.isActiveForSession(traineeId);
        return ResponseEntity.ok(ApiResponse.ok(active ? "Membership is active" : "Membership is not active", active));
    }
}
