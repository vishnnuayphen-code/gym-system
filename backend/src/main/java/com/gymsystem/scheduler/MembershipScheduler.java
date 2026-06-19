package com.gymsystem.scheduler;

import com.gymsystem.service.MembershipService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MembershipScheduler {

    private static final Logger log = LoggerFactory.getLogger(MembershipScheduler.class);

    private final MembershipService membershipService;

    public MembershipScheduler(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    /**
     * Runs every day at midnight to mark expired memberships.
     * Cron: second minute hour day month weekday
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void expireMemberships() {
        log.info("[Scheduler] Running membership expiration check...");
        membershipService.checkAndExpireMemberships();
        log.info("[Scheduler] Membership expiration check completed.");
    }
}
