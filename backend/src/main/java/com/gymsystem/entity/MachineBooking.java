package com.gymsystem.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "machine_bookings")
public class MachineBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainee_id", nullable = false)
    private TraineeProfile trainee; // Referencing TraineeProfile based on earlier search

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "availability_id", nullable = false)
    private MachineAvailability availability;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "booking_start_time", nullable = false)
    private LocalTime bookingStartTime;

    @Column(name = "booking_end_time", nullable = false)
    private LocalTime bookingEndTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booked_by_coach_id")
    private CoachProfile bookedByCoach;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Enumerated(EnumType.STRING)
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        CONFIRMED, CANCELLED, COMPLETED
    }

    public MachineBooking() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Machine getMachine() { return machine; }
    public void setMachine(Machine machine) { this.machine = machine; }

    public TraineeProfile getTrainee() { return trainee; }
    public void setTrainee(TraineeProfile trainee) { this.trainee = trainee; }

    public MachineAvailability getAvailability() { return availability; }
    public void setAvailability(MachineAvailability availability) { this.availability = availability; }

    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }

    public LocalTime getBookingStartTime() { return bookingStartTime; }
    public void setBookingStartTime(LocalTime bookingStartTime) { this.bookingStartTime = bookingStartTime; }

    public LocalTime getBookingEndTime() { return bookingEndTime; }
    public void setBookingEndTime(LocalTime bookingEndTime) { this.bookingEndTime = bookingEndTime; }

    public CoachProfile getBookedByCoach() { return bookedByCoach; }
    public void setBookedByCoach(CoachProfile bookedByCoach) { this.bookedByCoach = bookedByCoach; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
