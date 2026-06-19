package com.gymsystem.repository;

import com.gymsystem.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {
    List<MembershipPlan> findByGymId(Long gymId);
}
