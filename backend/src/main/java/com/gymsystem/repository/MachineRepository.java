package com.gymsystem.repository;

import com.gymsystem.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByGymId(Long gymId);
    
    @Query("SELECT m FROM Machine m WHERE m.gym.id = :gymId AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.type) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Machine> searchByGymId(@Param("gymId") Long gymId, @Param("search") String search);
    
    List<Machine> findByGymIdAndStatus(Long gymId, Machine.Status status);
}
