package com.gymsystem.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.gymsystem.entity.AttendanceStatus;
import com.gymsystem.entity.CheckInMethod;

public record AttendanceDTO(
    Long id,
    Long traineeId,
    String traineeName,
    String traineeEmail,
    Long markedById,
    String markedByName,
    LocalDate attendanceDate,
    AttendanceStatus status,
    String notes,
    LocalDateTime checkInTime,
    LocalDateTime checkOutTime,
    CheckInMethod checkInMethod,
    Double temperatureReading,
    Boolean isMaskWorn
) {}
