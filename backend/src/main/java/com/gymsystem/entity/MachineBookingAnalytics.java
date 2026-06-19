package com.gymsystem.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "machine_booking_analytics")
public class MachineBookingAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private Machine machine;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "total_bookings")
    private Integer totalBookings = 0;

    @Column(name = "completed_bookings")
    private Integer completedBookings = 0;

    @Column(name = "cancelled_bookings")
    private Integer cancelledBookings = 0;

    @Column(name = "peak_hours", columnDefinition = "TEXT")
    private String peakHours;

    @Column(name = "average_utilization")
    private Float averageUtilization = 0f;

    @Column(name = "total_hours_available")
    private Float totalHoursAvailable = 0f;

    @Column(name = "total_hours_booked")
    private Float totalHoursBooked = 0f;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public MachineBookingAnalytics() {}

    public MachineBookingAnalytics(Machine machine, LocalDate date) {
        this.machine = machine;
        this.date = date;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        recalculateUtilization();
    }

    public void recalculateUtilization() {
        if (totalHoursAvailable > 0) {
            averageUtilization = (totalHoursBooked / totalHoursAvailable) * 100f;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Machine getMachine() { return machine; }
    public void setMachine(Machine machine) { this.machine = machine; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Integer getTotalBookings() { return totalBookings; }
    public void setTotalBookings(Integer totalBookings) { this.totalBookings = totalBookings; }

    public Integer getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(Integer completedBookings) { this.completedBookings = completedBookings; }

    public Integer getCancelledBookings() { return cancelledBookings; }
    public void setCancelledBookings(Integer cancelledBookings) { this.cancelledBookings = cancelledBookings; }

    public String getPeakHours() { return peakHours; }
    public void setPeakHours(String peakHours) { this.peakHours = peakHours; }

    public Float getAverageUtilization() { return averageUtilization; }
    public void setAverageUtilization(Float averageUtilization) { this.averageUtilization = averageUtilization; }

    public Float getTotalHoursAvailable() { return totalHoursAvailable; }
    public void setTotalHoursAvailable(Float totalHoursAvailable) { this.totalHoursAvailable = totalHoursAvailable; }

    public Float getTotalHoursBooked() { return totalHoursBooked; }
    public void setTotalHoursBooked(Float totalHoursBooked) { this.totalHoursBooked = totalHoursBooked; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
