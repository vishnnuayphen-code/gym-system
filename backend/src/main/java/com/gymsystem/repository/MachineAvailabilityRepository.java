package com.gymsystem.repository;

import com.gymsystem.entity.MachineAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineAvailabilityRepository extends JpaRepository<MachineAvailability, Long> {
    List<MachineAvailability> findByMachineId(Long machineId);
    List<MachineAvailability> findByMachineIdAndIsActiveTrue(Long machineId);
}
