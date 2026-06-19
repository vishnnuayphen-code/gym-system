package com.gymsystem.repository;

import com.gymsystem.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByTraineeMembershipId(Long membershipId);
    List<Payment> findByPaymentDateBetween(LocalDate start, LocalDate end);
    List<Payment> findByTraineeMembershipTraineeGymIdAndPaymentDateBetween(Long gymId, LocalDate start, LocalDate end);
    List<Payment> findByTraineeMembershipTraineeId(Long traineeId);
    List<Payment> findTop20ByGymIdOrderByPaymentDateDesc(Long gymId);
    Optional<Payment> findTopByTraineeMembershipIdOrderByPaymentDateDesc(Long membershipId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.gym.id = :gymId")
    BigDecimal sumAmountByGymId(@Param("gymId") Long gymId);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.gym.id = :gymId AND s.status IN ('SCHEDULED', 'IN_PROGRESS')")
    long countActiveSessionsByGymId(@Param("gymId") Long gymId);
}
