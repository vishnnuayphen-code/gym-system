package com.gymsystem.enums;

public enum MembershipStatus {
    ACTIVE,    // membership exists and endDate > today
    EXPIRING,  // membership exists and endDate is within 7 days from today
    EXPIRED,   // membership exists but endDate < today
    NO_PLAN    // no membership assigned yet
}
