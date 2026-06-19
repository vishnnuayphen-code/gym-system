package com.gymsystem.controller;

import com.gymsystem.dto.ApiResponse;
import com.gymsystem.dto.CreateSessionRequest;
import com.gymsystem.dto.UpdateSessionRequest;
import com.gymsystem.dto.AcceptSessionRequest;
import com.gymsystem.entity.Session;
import com.gymsystem.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    private Long getGymIdFromRequest(HttpServletRequest request) {
        Object gymIdObj = request.getAttribute("gymId");
        if (gymIdObj == null) return null;
        if (gymIdObj instanceof Integer integer) return integer.longValue();
        if (gymIdObj instanceof Long aLong) return aLong;
        return Long.valueOf(gymIdObj.toString());
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('create_sessions') or hasAnyRole('OWNER', 'COACH', 'ADMIN', 'TRAINEE')")
    public ResponseEntity<ApiResponse<Session>> createSession(
            @Valid @RequestBody CreateSessionRequest createSessionRequest,
            HttpServletRequest request
    ) {
        Long gymId = getGymIdFromRequest(request);
        Session session = sessionService.createSession(createSessionRequest, gymId);
        return ResponseEntity.ok(ApiResponse.ok("Session created successfully", session));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('view_sessions') or hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Session>>> getAllSessions(HttpServletRequest request) {
        Long gymId = getGymIdFromRequest(request);
        List<Session> sessions = sessionService.getAllSessions(gymId);
        return ResponseEntity.ok(ApiResponse.ok("All sessions retrieved", sessions));
    }

    @GetMapping("/coach/{coachId}")
    @PreAuthorize("hasAnyAuthority('view_sessions') or hasAnyRole('OWNER', 'COACH')")
    public ResponseEntity<ApiResponse<List<Session>>> getCoachSessions(@PathVariable("coachId") Long coachId) {
        List<Session> sessions = sessionService.getCoachSessions(coachId);
        return ResponseEntity.ok(ApiResponse.ok("Coach sessions retrieved", sessions));
    }

    @GetMapping("/trainee/{traineeId}")
    @PreAuthorize("hasAnyAuthority('view_sessions') or hasAnyRole('OWNER', 'COACH', 'TRAINEE')")
    public ResponseEntity<ApiResponse<List<Session>>> getTraineeSessions(@PathVariable("traineeId") Long traineeId) {
        List<Session> sessions = sessionService.getTraineeSessions(traineeId);
        return ResponseEntity.ok(ApiResponse.ok("Trainee sessions retrieved", sessions));
    }

    @PutMapping("/{sessionId}")
    @PreAuthorize("hasAnyAuthority('update_sessions') or hasAnyRole('OWNER', 'COACH', 'ADMIN')")
    public ResponseEntity<ApiResponse<Session>> updateSession(
            @PathVariable("sessionId") Long sessionId,
            @Valid @RequestBody UpdateSessionRequest request
    ) {
        Session session = sessionService.updateSession(sessionId, request);
        return ResponseEntity.ok(ApiResponse.ok("Session updated successfully", session));
    }

    @DeleteMapping("/{sessionId}")
    @PreAuthorize("hasAnyAuthority('cancel_sessions') or hasAnyRole('OWNER', 'COACH', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelSession(@PathVariable("sessionId") Long sessionId) {
        sessionService.cancelSession(sessionId);
        return ResponseEntity.ok(ApiResponse.ok("Session cancelled successfully"));
    }

    @PostMapping("/{sessionId}/accept")
    @PreAuthorize("hasRole('COACH')")
    public ResponseEntity<ApiResponse<Session>> acceptSession(
            @PathVariable("sessionId") Long sessionId,
            @RequestBody AcceptSessionRequest acceptRequest,
            Authentication authentication
    ) {
        Long coachId = Long.valueOf(authentication.getName()); 
        Session session = sessionService.acceptSession(sessionId, coachId, acceptRequest);
        return ResponseEntity.ok(ApiResponse.ok("Session accepted successfully", session));
    }

    @PostMapping("/{sessionId}/reject")
    @PreAuthorize("hasRole('COACH')")
    public ResponseEntity<ApiResponse<Session>> rejectSession(
            @PathVariable("sessionId") Long sessionId,
            Authentication authentication
    ) {
        Long coachId = Long.valueOf(authentication.getName()); 
        Session session = sessionService.rejectSession(sessionId, coachId);
        return ResponseEntity.ok(ApiResponse.ok("Session rejected successfully", session));
    }

    @PostMapping("/{sessionId}/book-machine")
    @PreAuthorize("hasAnyRole('COACH', 'TRAINEE')")
    public ResponseEntity<ApiResponse<Session>> bookMachine(
            @PathVariable("sessionId") Long sessionId,
            @RequestParam("machineId") Long machineId,
            Authentication authentication
    ) {
        Long userId = Long.valueOf(authentication.getName());
        String role = authentication.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .filter(r -> r.equals("COACH") || r.equals("TRAINEE"))
                .findFirst()
                .orElse("");
                
        Session session = sessionService.bookMachine(sessionId, machineId, userId, role);
        return ResponseEntity.ok(ApiResponse.ok("Machine booked successfully", session));
    }
}
