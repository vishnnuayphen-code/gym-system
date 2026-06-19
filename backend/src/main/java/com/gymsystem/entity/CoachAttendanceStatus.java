package com.gymsystem.entity;

public enum CoachAttendanceStatus {
    PRESENT,    // full day or all sessions attended
    HALF_DAY,   // session-based coach attended only one of two sessions
    ABSENT      // did not attend
}
