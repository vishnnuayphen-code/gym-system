package com.gymsystem.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymsystem.entity.CoachProfile;

@Repository
public interface CoachProfileRepository extends JpaRepository<CoachProfile, Long> {
    List<CoachProfile> findByUser_GymId(Long gymId);
    java.util.Optional<CoachProfile> findByUserId(Long userId);
}
