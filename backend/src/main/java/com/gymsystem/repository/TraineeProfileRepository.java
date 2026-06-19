package com.gymsystem.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymsystem.entity.TraineeProfile;

@Repository
public interface TraineeProfileRepository extends JpaRepository<TraineeProfile, Long> {
    List<TraineeProfile> findByUser_GymId(Long gymId);
    Optional<TraineeProfile> findByUser_Id(Long userId);
}
