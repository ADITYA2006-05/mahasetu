package com.mahasetu.interop.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ConsentRequiredException extends RuntimeException {

    private final String errorCode;
    private final String requestId;

    public ConsentRequiredException(String message) {
        super(message);
        this.errorCode = "CONSENT_REQUIRED";
        this.requestId = null;
    }

    public ConsentRequiredException(String message, String requestId) {
        super(message);
        this.errorCode = "CONSENT_REQUIRED";
        this.requestId = requestId;
    }
}
