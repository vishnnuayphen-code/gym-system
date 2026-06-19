package com.gymsystem.repository;

import com.gymsystem.entity.MachineBookingWaitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MachineBookingWaitlistRepository extends JpaRepository<MachineBookingWaitlist, Long> {

    List<MachineBookingWaitlist> findByTraineeIdAndStatus(Long traineeId, MachineBookingWaitlist.WaitlistStatus status);

    List<MachineBookingWaitlist> findByMachineIdAndRequestedDateAndStatus(
        Long machineId,
        LocalDate requestedDate,
        MachineBookingWaitlist.WaitlistStatus status
    );

    @Query("SELECT w FROM MachineBookingWaitlist w WHERE w.machine.id = :machineId AND w.requestedDate = :date AND w.status = 'WAITING' ORDER BY w.position ASC")
    List<MachineBookingWaitlist> findWaitlistedUsersForMachineOnDate(
        @Param("machineId") Long machineId,
        @Param("date") LocalDate date
    );

    Optional<MachineBookingWaitlist> findFirstByMachineIdAndRequestedDateAndStatusOrderByPosition(
        Long machineId,
        LocalDate requestedDate,
        MachineBookingWaitlist.WaitlistStatus status
    );

    List<MachineBookingWaitlist> findByStatusAndExpiresAtLessThan(
        MachineBookingWaitlist.WaitlistStatus status,
        LocalDateTime expiresAt
    );

    long countByMachineIdAndRequestedDateAndStatus(
        Long machineId,
        LocalDate requestedDate,
        MachineBookingWaitlist.WaitlistStatus status
    );

    List<MachineBookingWaitlist> findByTraineeIdOrderByCreatedAtDesc(Long traineeId);
}
