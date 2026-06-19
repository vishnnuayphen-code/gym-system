package com.gymsystem.service;

import com.gymsystem.dto.*;
import com.gymsystem.entity.*;
import com.gymsystem.exception.InvalidPaymentException;
import com.gymsystem.exception.MembershipExpiredException;
import com.gymsystem.exception.MembershipNotFoundException;
import com.gymsystem.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MembershipService {

    private final MembershipPlanRepository planRepository;
    private final TraineeMembershipRepository membershipRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final GymRepository gymRepository;
    private final TraineeProfileRepository traineeProfileRepository;

    public MembershipService(MembershipPlanRepository planRepository,
                             TraineeMembershipRepository membershipRepository,
                             PaymentRepository paymentRepository,
                             UserRepository userRepository,
                             GymRepository gymRepository,
                             TraineeProfileRepository traineeProfileRepository) {
        this.planRepository = planRepository;
        this.membershipRepository = membershipRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.gymRepository = gymRepository;
        this.traineeProfileRepository = traineeProfileRepository;
    }

    // ── Membership Plans ────────────────────────────────────────────────────

    @Transactional
    public MembershipPlan createPlan(CreateMembershipPlanRequest request, Long gymId) {
        Gym gym = gymRepository.findById(gymId)
                .orElseThrow(() -> new IllegalArgumentException("Gym not found with id: " + gymId));

        MembershipPlan plan = new MembershipPlan();
        plan.setGym(gym);
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setDurationDays(request.getDurationDays());
        plan.setPrice(request.getPrice());
        plan.setCategory(request.getCategory() != null ? request.getCategory() : PlanCategory.BASIC);
        plan.setValidityDays(request.getValidityDays() != null ? request.getValidityDays() : request.getDurationDays());
        plan.setMaxConsultations(request.getMaxConsultations());
        plan.setIsPersonalTrainingIncluded(request.getIsPersonalTrainingIncluded());
        plan.setAccessLevel(request.getAccessLevel());

        return planRepository.save(plan);
    }

    public List<MembershipPlanResponse> getPlans(Long gymId) {
        return planRepository.findByGymId(gymId).stream()
                .map(this::toPlanResponse)
                .collect(Collectors.toList());
    }

    public MembershipPlan getPlanById(Long planId) {
        return planRepository.findById(planId)
                .orElseThrow(() -> new MembershipNotFoundException("Membership plan not found with id: " + planId));
    }

    public MembershipPlanResponse getPlanResponseById(Long planId) {
        return toPlanResponse(getPlanById(planId));
    }

    private MembershipPlanResponse toPlanResponse(MembershipPlan plan) {
        MembershipPlanResponse res = new MembershipPlanResponse();
        res.setId(plan.getId());
        res.setName(plan.getName());
        res.setDescription(plan.getDescription());
        res.setDurationDays(plan.getDurationDays());
        res.setPrice(plan.getPrice());
        res.setCategory(plan.getCategory());
        res.setValidityDays(plan.getValidityDays());
        res.setMaxConsultations(plan.getMaxConsultations());
        res.setIsPersonalTrainingIncluded(plan.getIsPersonalTrainingIncluded());
        res.setAccessLevel(plan.getAccessLevel());
        res.setCreatedAt(plan.getCreatedAt());
        res.setUpdatedAt(plan.getUpdatedAt());

        res.setSubscriberCount(membershipRepository.countByMembershipPlanId(plan.getId()));
        res.setActiveSubscriberCount(membershipRepository.countByMembershipPlanIdAndEndDateGreaterThanEqual(plan.getId(), LocalDate.now()));

        return res;
    }

    @Transactional
    public MembershipPlan updatePlan(Long planId, UpdateMembershipPlanRequest request) {
        MembershipPlan plan = getPlanById(planId);

        if (request.getName() != null) plan.setName(request.getName());
        if (request.getDescription() != null) plan.setDescription(request.getDescription());
        if (request.getDurationDays() != null) plan.setDurationDays(request.getDurationDays());
        if (request.getPrice() != null) plan.setPrice(request.getPrice());
        if (request.getCategory() != null) plan.setCategory(request.getCategory());
        if (request.getValidityDays() != null) plan.setValidityDays(request.getValidityDays());
        if (request.getMaxConsultations() != null) plan.setMaxConsultations(request.getMaxConsultations());
        if (request.getIsPersonalTrainingIncluded() != null) plan.setIsPersonalTrainingIncluded(request.getIsPersonalTrainingIncluded());
        if (request.getAccessLevel() != null) plan.setAccessLevel(request.getAccessLevel());

        return planRepository.save(plan);
    }

    // ── Assign Membership ────────────────────────────────────────────────────

    @Transactional
    public TraineeMembership assignMembership(AssignMembershipRequest request) {
        User trainee = userRepository.findById(request.getTraineeId())
                .orElseThrow(() -> new IllegalArgumentException("Trainee not found with id: " + request.getTraineeId()));

        MembershipPlan plan = planRepository.findById(request.getMembershipPlanId())
                .orElseThrow(() -> new MembershipNotFoundException("Membership plan not found"));

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate endDate = startDate.plusDays(plan.getDurationDays());

        TraineeMembership membership = new TraineeMembership();
        membership.setTrainee(trainee);
        membership.setMembershipPlan(plan);
        membership.setStartDate(startDate);
        membership.setEndDate(endDate);
        membership.setStatus(MembershipStatus.PENDING); // Start as PENDING

        return membershipRepository.save(membership);
    }

    public TraineeMembership getTraineeMembership(Long traineeId) {
        return membershipRepository.findTopByTraineeIdOrderByCreatedAtDesc(traineeId)
                .orElseThrow(() -> new MembershipNotFoundException("No membership found for trainee id: " + traineeId));
    }

    public TraineeMembership getTraineeMembershipById(Long id) {
        return membershipRepository.findById(id)
                .orElseThrow(() -> new MembershipNotFoundException("Membership not found with id: " + id));
    }

    public List<TraineeMembership> getAllTraineeMemberships(Long traineeId) {
        return membershipRepository.findByTraineeId(traineeId);
    }

    // ── Payment ────────────────────────────────────────────────────────────

    @Transactional
    public Payment recordPayment(RecordPaymentRequest request) {
        TraineeMembership membership = membershipRepository.findById(request.getTraineeMembershipId())
                .orElseThrow(() -> new MembershipNotFoundException("Membership not found with id: " + request.getTraineeMembershipId()));

        if (membership.getStatus() == MembershipStatus.CANCELLED) {
            throw new InvalidPaymentException("Cannot record payment for a cancelled membership.");
        }

        if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new InvalidPaymentException("Payment amount must be greater than zero.");
        }

        String txRef = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        java.math.BigDecimal tax = request.getTaxAmount() != null ? request.getTaxAmount() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal total = request.getAmount().add(tax).subtract(discount);

        Payment payment = new Payment();
        payment.setTraineeMembership(membership);
        payment.setTrainee(membership.getTrainee());
        if (membership.getTrainee() != null) {
            payment.setGym(membership.getTrainee().getGym());
            System.out.println("DEBUG: Recording payment for traineeID: " + membership.getTrainee().getId() + ", gymID: " + (membership.getTrainee().getGym() != null ? membership.getTrainee().getGym().getId() : "null"));
        } else {
            System.out.println("DEBUG: Trainee is NULL in membership!");
        }
        payment.setAmount(request.getAmount());
        payment.setTaxAmount(tax);
        payment.setDiscountAmount(discount);
        payment.setTotalAmount(total);
        payment.setBillingAddress(request.getBillingAddress());
        payment.setPaymentGateway(request.getPaymentGateway());
        payment.setPaymentDate(LocalDate.now());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setTransactionReference(txRef);

        // Activate membership on payment
        if (membership.getStatus() == MembershipStatus.PENDING) {
            membership.setStatus(MembershipStatus.ACTIVE);
            membershipRepository.save(membership);
        }

        return paymentRepository.save(payment);
    }

    public List<Payment> getRecentPayments(Long gymId) {
        return paymentRepository.findTop20ByGymIdOrderByPaymentDateDesc(gymId);
    }

    public List<Payment> getPaymentHistory(Long traineeId) {
        return paymentRepository.findByTraineeMembershipTraineeId(traineeId);
    }

    // ── Session Validation ────────────────────────────────────────────────

    public boolean isActiveForSession(Long traineeId) {
        return membershipRepository.findTopByTraineeIdOrderByCreatedAtDesc(traineeId)
                .map(m -> m.getStatus() == MembershipStatus.ACTIVE)
                .orElse(false);
    }

    public void validateActiveMembership(Long traineeId) {
        TraineeMembership membership = membershipRepository.findTopByTraineeIdOrderByCreatedAtDesc(traineeId)
                .orElseThrow(() -> new MembershipNotFoundException("No active membership found for trainee."));

        if (membership.getStatus() != MembershipStatus.ACTIVE) {
            throw new MembershipExpiredException("Trainee's membership is " + membership.getStatus().name().toLowerCase() + ". Please renew to book sessions.");
        }
    }

    // ── Expiry Check (called by scheduler) ───────────────────────────────

    @Transactional
    public void checkAndExpireMemberships() {
        List<TraineeMembership> expired = membershipRepository
                .findByStatusAndEndDateBefore(MembershipStatus.ACTIVE, LocalDate.now());

        for (TraineeMembership membership : expired) {
            membership.setStatus(MembershipStatus.EXPIRED);
        }

        if (!expired.isEmpty()) {
            membershipRepository.saveAll(expired);
        }
    }

    // ── Subscribers ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PlanSubscriberResponse> getSubscribersByPlan(Long planId) {
        // Verify plan exists
        planRepository.findById(planId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found"));

        List<TraineeMembership> memberships = membershipRepository.findByMembershipPlanId(planId);

        return memberships.stream()
            .map(this::toSubscriberResponse)
            .sorted((a, b) -> {
                Integer d1 = a.getDaysRemaining();
                Integer d2 = b.getDaysRemaining();
                if (d1 == null) return 1;
                if (d2 == null) return -1;
                return d1.compareTo(d2);
            })
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlanSubscriberResponse> getAllActiveMemberships() {
        LocalDate today = LocalDate.now();
        List<TraineeMembership> active = membershipRepository.findByEndDateGreaterThanEqual(today);

        return active.stream()
            .map(this::toSubscriberResponse)
            .sorted((a, b) -> {
                Integer d1 = a.getDaysRemaining();
                Integer d2 = b.getDaysRemaining();
                if (d1 == null) return 1;
                if (d2 == null) return -1;
                return d1.compareTo(d2);
            })
            .collect(Collectors.toList());
    }

    private PlanSubscriberResponse toSubscriberResponse(TraineeMembership m) {
        PlanSubscriberResponse res = new PlanSubscriberResponse();
        LocalDate today = LocalDate.now();

        if (m.getTrainee() != null) {
            res.setTraineeId(m.getTrainee().getId());
            res.setTraineeName(m.getTrainee().getName());
            res.setTraineeEmail(m.getTrainee().getEmail());
            res.setTraineePhotoUrl(m.getTrainee().getProfilePhotoUrl());
            
            traineeProfileRepository.findByUser_Id(m.getTrainee().getId())
                .ifPresent(profile -> res.setTraineePhone(profile.getPhone()));
        }

        if (m.getMembershipPlan() != null) {
            res.setPlanId(m.getMembershipPlan().getId());
            res.setPlanName(m.getMembershipPlan().getName());
            res.setPlanPrice(m.getMembershipPlan().getPrice());
            res.setPlanDurationDays(m.getMembershipPlan().getDurationDays());
        }

        res.setMembershipId(m.getId());
        if (m.getStartDate() != null) res.setStartDate(m.getStartDate().toString());
        if (m.getEndDate() != null) {
            res.setEndDate(m.getEndDate().toString());
            long days = ChronoUnit.DAYS.between(today, m.getEndDate());
            res.setDaysRemaining((int) days);

            if (m.getStatus() == MembershipStatus.PENDING) {
                res.setMembershipStatus("PENDING");
            } else if (days < 0) {
                res.setMembershipStatus("EXPIRED");
            } else if (days <= 7) {
                res.setMembershipStatus("EXPIRING");
            } else {
                res.setMembershipStatus("ACTIVE");
            }
        }

        paymentRepository.findTopByTraineeMembershipIdOrderByPaymentDateDesc(m.getId())
            .ifPresent(p -> {
                res.setAmountPaid(p.getAmount());
                res.setPaymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod().name() : null);
                res.setPaymentDate(p.getPaymentDate() != null ? p.getPaymentDate().toString() : null);
            });

        return res;
    }
}
