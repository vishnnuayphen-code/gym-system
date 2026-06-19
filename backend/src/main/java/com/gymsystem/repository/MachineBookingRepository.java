package com.gymsystem.repository;

import com.gymsystem.entity.MachineBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MachineBookingRepository extends JpaRepository<MachineBooking, Long> {

    List<MachineBooking> findByMachineIdAndBookingDate(Long machineId, LocalDate bookingDate);

    List<MachineBooking> findByAvailabilityIdAndBookingDateAndStatus(
        Long availabilityId,
        LocalDate bookingDate,
        MachineBooking.BookingStatus status
    );

    long countByAvailabilityIdAndBookingDateAndStatus(
        Long availabilityId,
        LocalDate bookingDate,
        MachineBooking.BookingStatus status
    );

    // New queries for enhanced booking system
    List<MachineBooking> findByTraineeIdAndStatus(Long traineeId, MachineBooking.BookingStatus status);

    List<MachineBooking> findByTraineeIdAndBookingDateGreaterThanEqual(Long traineeId, LocalDate bookingDate);

    List<MachineBooking> findByMachineIdAndBookingStartTimeAndBookingEndTime(
        Long machineId,
        java.time.LocalTime startTime,
        java.time.LocalTime endTime
    );

    @Query("SELECT mb FROM MachineBooking mb WHERE mb.machine.id = :machineId AND mb.bookingDate = :date AND mb.status = 'CONFIRMED'")
    List<MachineBooking> findConfirmedBookingsForMachineOnDate(
        @Param("machineId") Long machineId,
        @Param("date") LocalDate date
    );

    List<MachineBooking> findByMachineIdAndStatusAndBookingDateBetween(
        Long machineId,
        MachineBooking.BookingStatus status,
        LocalDate startDate,
        LocalDate endDate
    );

    long countByMachineIdAndStatusAndBookingDate(Long machineId, MachineBooking.BookingStatus status, LocalDate date);
}
