package com.gymsystem.controller;

import com.gymsystem.entity.*;
import com.gymsystem.repository.CoachProfileRepository;
import com.gymsystem.repository.TraineeProfileRepository;
import com.gymsystem.service.AuthService;
import com.gymsystem.service.MachineBookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/machines/bookings")
public class MachineBookingController {

    @Autowired
    private MachineBookingService bookingService;

    @Autowired
    private AuthService authService;

    @Autowired
    private TraineeProfileRepository traineeRepository;

    @Autowired
    private CoachProfileRepository coachRepository;

    /**
     * Book a machine (trainee self-booking)
     * POST /api/machines/bookings/book
     */
    @PostMapping("/book")
    @PreAuthorize("hasRole('TRAINEE')")
    public ResponseEntity<?> bookMachine(@RequestBody Map<String, Object> payload) {
        try {
            User currentUser = authService.getCurrentUser();
            TraineeProfile trainee = traineeRepository.findByUser_Id(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Trainee profile not found"));

            Long machineId = Long.parseLong(payload.get("machineId").toString());
            LocalDate bookingDate = LocalDate.parse(payload.get("bookingDate").toString());
            LocalTime startTime = LocalTime.parse(payload.get("startTime").toString());
            LocalTime endTime = LocalTime.parse(payload.get("endTime").toString());

            MachineBooking booking = bookingService.bookMachine(
                    trainee.getId(),
                    machineId,
                    bookingDate,
                    startTime,
                    endTime
            );

            return ResponseEntity.ok(new BookingResponse(booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get trainee's bookings
     * GET /api/machines/bookings/my-bookings
     */
    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('TRAINEE')")
    public ResponseEntity<?> getMyBookings(
            @RequestParam(required = false) String status) {
        try {
            User currentUser = authService.getCurrentUser();
            TraineeProfile trainee = traineeRepository.findByUser_Id(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Trainee profile not found"));

            MachineBooking.BookingStatus bookingStatus = null;

            if (status != null && !status.isEmpty()) {
                bookingStatus = MachineBooking.BookingStatus.valueOf(status.toUpperCase());
            }

            List<MachineBooking> bookings = bookingService.getTraineeBookings(
                    trainee.getId(),
                    bookingStatus
            );

            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get upcoming bookings for trainee
     * GET /api/machines/bookings/upcoming
     */
    @GetMapping("/upcoming")
    @PreAuthorize("hasRole('TRAINEE')")
    public ResponseEntity<?> getUpcomingBookings() {
        try {
            User currentUser = authService.getCurrentUser();
            TraineeProfile trainee = traineeRepository.findByUser_Id(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Trainee profile not found"));

            List<MachineBooking> bookings = bookingService.getUpcomingBookings(
                    trainee.getId()
            );
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Coach books machine for trainee
     * POST /api/machines/bookings/coach-book
     */
    @PostMapping("/coach-book")
    @PreAuthorize("hasRole('COACH')")
    public ResponseEntity<?> coachBookMachine(@RequestBody Map<String, Object> payload) {
        try {
            User currentUser = authService.getCurrentUser();
            CoachProfile coach = coachRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Coach profile not found"));

            Long traineeId = Long.parseLong(payload.get("traineeId").toString());
            Long machineId = Long.parseLong(payload.get("machineId").toString());
            LocalDate bookingDate = LocalDate.parse(payload.get("bookingDate").toString());
            LocalTime startTime = LocalTime.parse(payload.get("startTime").toString());
            LocalTime endTime = LocalTime.parse(payload.get("endTime").toString());
            String notes = payload.getOrDefault("notes", "").toString();

            MachineBooking booking = bookingService.coachBookMachine(
                    coach.getId(),
                    traineeId,
                    machineId,
                    bookingDate,
                    startTime,
                    endTime,
                    notes
            );

            return ResponseEntity.ok(new BookingResponse(booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cancel booking
     * PUT /api/machines/bookings/{bookingId}/cancel
     */
    @PutMapping("/{bookingId}/cancel")
    @PreAuthorize("hasAnyRole('TRAINEE', 'COACH', 'ADMIN')")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long bookingId,
            @RequestBody Map<String, Object> payload) {
        try {
            String reason = payload.getOrDefault("reason", "User cancelled").toString();
            bookingService.cancelBooking(bookingId, reason);
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reschedule booking
     * PUT /api/machines/bookings/{bookingId}/reschedule
     */
    @PutMapping("/{bookingId}/reschedule")
    @PreAuthorize("hasAnyRole('TRAINEE', 'COACH', 'ADMIN')")
    public ResponseEntity<?> rescheduleBooking(
            @PathVariable Long bookingId,
            @RequestBody Map<String, Object> payload) {
        try {
            LocalDate newDate = LocalDate.parse(payload.get("newDate").toString());
            LocalTime newStartTime = LocalTime.parse(payload.get("newStartTime").toString());
            LocalTime newEndTime = LocalTime.parse(payload.get("newEndTime").toString());

            MachineBooking updated = bookingService.rescheduleBooking(
                    bookingId,
                    newDate,
                    newStartTime,
                    newEndTime
            );

            return ResponseEntity.ok(new BookingResponse(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Join waitlist for machine
     * POST /api/machines/waitlist/join
     */
    @PostMapping("/waitlist/join")
    @PreAuthorize("hasRole('TRAINEE')")
    public ResponseEntity<?> joinWaitlist(@RequestBody Map<String, Object> payload) {
        try {
            User currentUser = authService.getCurrentUser();
            TraineeProfile trainee = traineeRepository.findByUser_Id(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Trainee profile not found"));

            Long machineId = Long.parseLong(payload.get("machineId").toString());
            LocalDate requestedDate = LocalDate.parse(payload.get("requestedDate").toString());

            MachineBookingWaitlist waitlist = bookingService.joinWaitlist(
                    trainee.getId(),
                    machineId,
                    requestedDate
            );

            return ResponseEntity.ok(Map.of(
                    "id", waitlist.getId(),
                    "position", waitlist.getPosition(),
                    "status", waitlist.getStatus().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get waitlist position
     * GET /api/machines/waitlist/my-position
     */
    @GetMapping("/waitlist/my-position")
    @PreAuthorize("hasRole('TRAINEE')")
    public ResponseEntity<?> getWaitlistPosition(
            @RequestParam Long machineId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            User currentUser = authService.getCurrentUser();
            TraineeProfile trainee = traineeRepository.findByUser_Id(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Trainee profile not found"));

            MachineBookingWaitlist position = bookingService.getWaitlistPosition(
                    trainee.getId(),
                    machineId,
                    date
            );

            if (position == null) {
                return ResponseEntity.ok(Map.of("message", "Not in waitlist"));
            }

            return ResponseEntity.ok(Map.of(
                    "id", position.getId(),
                    "position", position.getPosition(),
                    "status", position.getStatus().toString(),
                    "expiresAt", position.getExpiresAt()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Leave waitlist
     * DELETE /api/machines/waitlist/{waitlistId}
     */
    @DeleteMapping("/waitlist/{waitlistId}")
    @PreAuthorize("hasRole('TRAINEE')")
    public ResponseEntity<?> leaveWaitlist(@PathVariable Long waitlistId) {
        try {
            bookingService.leaveWaitlist(waitlistId);
            return ResponseEntity.ok(Map.of("message", "Left waitlist successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DTO for responses
    public static class BookingResponse {
        public Long id;
        public Long machineId;
        public String machineName;
        public LocalDate bookingDate;
        public LocalTime startTime;
        public LocalTime endTime;
        public String coachName;
        public String status;

        public BookingResponse(MachineBooking booking) {
            this.id = booking.getId();
            this.machineId = booking.getMachine().getId();
            this.machineName = booking.getMachine().getName();
            this.bookingDate = booking.getBookingDate();
            this.startTime = booking.getBookingStartTime();
            this.endTime = booking.getBookingEndTime();
            this.coachName = booking.getBookedByCoach() != null ?
                    booking.getBookedByCoach().getUser().getName() : null;
            this.status = booking.getStatus().toString();
        }
    }
}
