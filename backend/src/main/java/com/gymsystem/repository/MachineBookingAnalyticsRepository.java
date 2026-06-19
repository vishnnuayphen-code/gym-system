package com.gymsystem.repository;

import com.gymsystem.entity.MachineBookingAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MachineBookingAnalyticsRepository extends JpaRepository<MachineBookingAnalytics, Long> {

    Optional<MachineBookingAnalytics> findByMachineIdAndDate(Long machineId, LocalDate date);

    List<MachineBookingAnalytics> findByMachineIdAndDateBetweenOrderByDateDesc(
        Long machineId,
        LocalDate startDate,
        LocalDate endDate
    );

    @Query("SELECT a FROM MachineBookingAnalytics a WHERE a.machine.id = :machineId ORDER BY a.date DESC LIMIT 30")
    List<MachineBookingAnalytics> findLast30DaysAnalytics(@Param("machineId") Long machineId);

    @Query("SELECT a FROM MachineBookingAnalytics a WHERE a.date = :date ORDER BY a.averageUtilization DESC")
    List<MachineBookingAnalytics> findTopUtilizedMachinesOnDate(@Param("date") LocalDate date);

    @Query("SELECT a FROM MachineBookingAnalytics a WHERE a.machine.id = :machineId ORDER BY a.date DESC")
    List<MachineBookingAnalytics> findAllByMachineIdOrderByDateDesc(@Param("machineId") Long machineId);

    List<MachineBookingAnalytics> findByMachineId(Long machineId);
}
