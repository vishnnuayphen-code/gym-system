package com.gymsystem.repository;

import com.gymsystem.entity.MembershipStatus;
import com.gymsystem.entity.TraineeMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface TraineeMembershipRepository extends JpaRepository<TraineeMembership, Long> {
    Optional<TraineeMembership> findTopByTraineeIdOrderByEndDateDesc(Long traineeId);
    Optional<TraineeMembership> findTopByTraineeIdOrderByCreatedAtDesc(Long traineeId);
    List<TraineeMembership> findByTraineeId(Long traineeId);
    List<TraineeMembership> findByStatusAndEndDateBefore(MembershipStatus status, LocalDate date);
    long countByStatus(MembershipStatus status);
    long countByStatusAndTraineeGymId(MembershipStatus status, Long gymId);

    // New methods for subscriber overview
    List<TraineeMembership> findByMembershipPlanId(Long planId);
    List<TraineeMembership> findByEndDateGreaterThanEqual(LocalDate date);
    int countByMembershipPlanId(Long planId);
    int countByMembershipPlanIdAndEndDateGreaterThanEqual(Long planId, LocalDate date);

    @Query("SELECT m.membershipPlan.id, COUNT(m) FROM TraineeMembership m GROUP BY m.membershipPlan.id")
    List<Object[]> countSubscribersPerPlan();

    List<TraineeMembership> findByTraineeGymIdAndEndDateBetween(Long gymId, LocalDate start, LocalDate end);
}
