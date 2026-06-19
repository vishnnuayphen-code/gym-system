package com.gymsystem.exception;

public class MembershipInactiveException extends RuntimeException {
    public MembershipInactiveException(String message) {
        super(message);
    }
}
