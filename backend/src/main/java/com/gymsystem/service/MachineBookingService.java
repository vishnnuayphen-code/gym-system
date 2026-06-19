package com.gymsystem.service;

import com.gymsystem.entity.*;
import com.gymsystem.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MachineBookingService {

    private final MachineBookingRepository bookingRepository;
    private final MachineBookingWaitlistRepository waitlistRepository;
    private final MachineBookingAnalyticsRepository analyticsRepository;
    private final MachineRepository machineRepository;
    private final MachineAvailabilityRepository availabilityRepository;
    private final TraineeProfileRepository traineeRepository;
    private final CoachProfileRepository coachRepository;
    private final NotificationService notificationService;

    public MachineBookingService(
            MachineBookingRepository bookingRepository,
            MachineBookingWaitlistRepository waitlistRepository,
            MachineBookingAnalyticsRepository analyticsRepository,
            MachineRepository machineRepository,
            MachineAvailabilityRepository availabilityRepository,
            TraineeProfileRepository traineeRepository,
            CoachProfileRepository coachRepository,
            NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.waitlistRepository = waitlistRepository;
        this.analyticsRepository = analyticsRepository;
        this.machineRepository = machineRepository;
        this.availabilityRepository = availabilityRepository;
        this.traineeRepository = traineeRepository;
        this.coachRepository = coachRepository;
        this.notificationService = notificationService;
    }

    /**
     * Book a machine for a trainee (trainee self-booking)
     */
    public MachineBooking bookMachine(Long traineeId, Long machineId, LocalDate bookingDate,
                                     LocalTime startTime, LocalTime endTime) {
        TraineeProfile trainee = traineeRepository.findById(traineeId)
                .orElseThrow(() -> new RuntimeException("Trainee not found"));

        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        // Validate booking is within gym hours
        LocalTime gymOpeningTime = machine.getGym().getOpeningTime();
        LocalTime gymClosingTime = machine.getGym().getClosingTime();

        if (gymOpeningTime != null && gymClosingTime != null) {
            if (startTime.isBefore(gymOpeningTime) || endTime.isAfter(gymClosingTime)) {
                throw new RuntimeException("Booking time must be within gym hours (" + gymOpeningTime + " - " + gymClosingTime + ")");
            }
        }

        // Check for time slot conflicts
        if (hasConflict(machineId, bookingDate, startTime, endTime)) {
            throw new RuntimeException("Time slot is unavailable or conflicts with existing booking");
        }

        // Find availability slot for the day of week
        String dayOfWeek = bookingDate.getDayOfWeek().toString();
        List<MachineAvailability> availabilitySlots = availabilityRepository.findByMachineIdAndIsActiveTrue(machineId);

        MachineAvailability selectedAvailability = availabilitySlots.stream()
                .filter(slot -> slot.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No availability slot for this day"));

        MachineBooking booking = new MachineBooking();
        booking.setMachine(machine);
        booking.setTrainee(trainee);
        booking.setAvailability(selectedAvailability);
        booking.setBookingDate(bookingDate);
        booking.setBookingStartTime(startTime);
        booking.setBookingEndTime(endTime);
        booking.setStatus(MachineBooking.BookingStatus.CONFIRMED);

        MachineBooking saved = bookingRepository.save(booking);

        // Send notification
        notificationService.sendBookingConfirmation(saved);

        // Update analytics
        updateAnalytics(machineId, bookingDate);

        return saved;
    }

    /**
     * Coach pre-books a machine for a trainee
     */
    public MachineBooking coachBookMachine(Long coachId, Long traineeId, Long machineId,
                                          LocalDate bookingDate, LocalTime startTime,
                                          LocalTime endTime, String notes) {
        CoachProfile coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));

        TraineeProfile trainee = traineeRepository.findById(traineeId)
                .orElseThrow(() -> new RuntimeException("Trainee not found"));

        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        // Validate booking is within gym hours
        LocalTime gymOpeningTime = machine.getGym().getOpeningTime();
        LocalTime gymClosingTime = machine.getGym().getClosingTime();

        if (gymOpeningTime != null && gymClosingTime != null) {
            if (startTime.isBefore(gymOpeningTime) || endTime.isAfter(gymClosingTime)) {
                throw new RuntimeException("Booking time must be within gym hours (" + gymOpeningTime + " - " + gymClosingTime + ")");
            }
        }

        // Check for conflicts
        if (hasConflict(machineId, bookingDate, startTime, endTime)) {
            throw new RuntimeException("Time slot is unavailable");
        }

        // Find availability slot for the day of week
        String dayOfWeek = bookingDate.getDayOfWeek().toString();
        List<MachineAvailability> availabilitySlots = availabilityRepository.findByMachineIdAndIsActiveTrue(machineId);

        MachineAvailability selectedAvailability = availabilitySlots.stream()
                .filter(slot -> slot.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No availability slot for this day"));

        MachineBooking booking = new MachineBooking();
        booking.setMachine(machine);
        booking.setTrainee(trainee);
        booking.setAvailability(selectedAvailability);
        booking.setBookedByCoach(coach);
        booking.setBookingDate(bookingDate);
        booking.setBookingStartTime(startTime);
        booking.setBookingEndTime(endTime);
        booking.setNotes(notes);
        booking.setStatus(MachineBooking.BookingStatus.CONFIRMED);

        MachineBooking saved = bookingRepository.save(booking);

        // Send notification to trainee
        notificationService.sendBookingConfirmation(saved);

        return saved;
    }

    /**
     * Cancel a machine booking
     */
    public void cancelBooking(Long bookingId, String reason) {
        MachineBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(MachineBooking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(LocalDateTime.now());

        bookingRepository.save(booking);

        // Notify user
        notificationService.sendCancellationNotification(booking);

        // Process waitlist
        processWaitlist(booking.getMachine().getId(), booking.getBookingDate());

        // Update analytics
        updateAnalytics(booking.getMachine().getId(), booking.getBookingDate());
    }

    /**
     * Reschedule a booking
     */
    public MachineBooking rescheduleBooking(Long bookingId, LocalDate newDate,
                                           LocalTime newStartTime, LocalTime newEndTime) {
        MachineBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check for conflicts on new date/time
        if (hasConflict(booking.getMachine().getId(), newDate, newStartTime, newEndTime)) {
            throw new RuntimeException("New time slot is unavailable");
        }

        booking.setBookingDate(newDate);
        booking.setBookingStartTime(newStartTime);
        booking.setBookingEndTime(newEndTime);

        MachineBooking updated = bookingRepository.save(booking);

        // Notify trainee of reschedule
        notificationService.sendRescheduleNotification(updated);

        return updated;
    }

    /**
     * Get bookings for a specific trainee
     */
    public List<MachineBooking> getTraineeBookings(Long traineeId, MachineBooking.BookingStatus status) {
        if (status != null) {
            return bookingRepository.findByTraineeIdAndStatus(traineeId, status);
        }
        return bookingRepository.findByTraineeIdAndBookingDateGreaterThanEqual(traineeId, LocalDate.now());
    }

    /**
     * Get upcoming bookings for a trainee (from today onwards)
     */
    public List<MachineBooking> getUpcomingBookings(Long traineeId) {
        return bookingRepository.findByTraineeIdAndBookingDateGreaterThanEqual(traineeId, LocalDate.now());
    }

    /**
     * Check if time slot has conflicts
     */
    private boolean hasConflict(Long machineId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<MachineBooking> bookings = bookingRepository.findConfirmedBookingsForMachineOnDate(machineId, date);

        for (MachineBooking booking : bookings) {
            // Check if new slot overlaps with existing booking
            if (startTime.isBefore(booking.getBookingEndTime()) && endTime.isAfter(booking.getBookingStartTime())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Process waitlist when a booking is cancelled
     */
    private void processWaitlist(Long machineId, LocalDate date) {
        List<MachineBookingWaitlist> waitlisted =
                waitlistRepository.findWaitlistedUsersForMachineOnDate(machineId, date);

        if (waitlisted.isEmpty()) return;

        // Notify first person in queue
        MachineBookingWaitlist firstInQueue = waitlisted.get(0);
        firstInQueue.setStatus(MachineBookingWaitlist.WaitlistStatus.NOTIFIED);
        firstInQueue.setNotifiedAt(LocalDateTime.now());
        waitlistRepository.save(firstInQueue);

        // Send notification to user
        User user = firstInQueue.getTrainee().getUser();
        notificationService.sendMachineAvailableNotification(user, machineId, date);

        // Reorder remaining waitlist
        for (int i = 1; i < waitlisted.size(); i++) {
            waitlisted.get(i).setPosition(i);
            waitlistRepository.save(waitlisted.get(i));
        }
    }

    /**
     * Update analytics for a machine on a specific date
     */
    private void updateAnalytics(Long machineId, LocalDate date) {
        MachineBookingAnalytics analytics = analyticsRepository.findByMachineIdAndDate(machineId, date)
                .orElse(new MachineBookingAnalytics(
                        machineRepository.findById(machineId).orElse(null),
                        date
                ));

        // Update counts
        long confirmed = bookingRepository.countByMachineIdAndStatusAndBookingDate(
                machineId,
                MachineBooking.BookingStatus.CONFIRMED,
                date
        );
        long cancelled = bookingRepository.countByMachineIdAndStatusAndBookingDate(
                machineId,
                MachineBooking.BookingStatus.CANCELLED,
                date
        );

        analytics.setTotalBookings((int) (confirmed + cancelled));
        analytics.setCompletedBookings((int) confirmed);
        analytics.setCancelledBookings((int) cancelled);
        analytics.recalculateUtilization();

        analyticsRepository.save(analytics);
    }

    /**
     * Join waitlist for unavailable machine slot
     */
    public MachineBookingWaitlist joinWaitlist(Long traineeId, Long machineId, LocalDate requestedDate) {
        TraineeProfile trainee = traineeRepository.findById(traineeId)
                .orElseThrow(() -> new RuntimeException("Trainee not found"));

        Machine machine = machineRepository.findById(machineId)
                .orElseThrow(() -> new RuntimeException("Machine not found"));

        // Get next position in queue
        long currentWaitlistCount = waitlistRepository.countByMachineIdAndRequestedDateAndStatus(
                machineId,
                requestedDate,
                MachineBookingWaitlist.WaitlistStatus.WAITING
        );

        MachineBookingWaitlist waitlist = new MachineBookingWaitlist(
                trainee,
                machine,
                requestedDate,
                (int) (currentWaitlistCount + 1)
        );

        return waitlistRepository.save(waitlist);
    }

    /**
     * Leave waitlist
     */
    public void leaveWaitlist(Long waitlistId) {
        MachineBookingWaitlist waitlist = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new RuntimeException("Waitlist entry not found"));

        waitlistRepository.delete(waitlist);

        // Reorder remaining entries
        Long machineId = waitlist.getMachine().getId();
        LocalDate date = waitlist.getRequestedDate();

        List<MachineBookingWaitlist> remaining =
                waitlistRepository.findWaitlistedUsersForMachineOnDate(machineId, date);

        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setPosition(i + 1);
            waitlistRepository.save(remaining.get(i));
        }
    }

    /**
     * Get waitlist position for a trainee
     */
    public MachineBookingWaitlist getWaitlistPosition(Long traineeId, Long machineId, LocalDate date) {
        List<MachineBookingWaitlist> waitlist =
                waitlistRepository.findByMachineIdAndRequestedDateAndStatus(
                        machineId,
                        date,
                        MachineBookingWaitlist.WaitlistStatus.WAITING
                );

        return waitlist.stream()
                .filter(w -> w.getTrainee().getId().equals(traineeId))
                .findFirst()
                .orElse(null);
    }
}
