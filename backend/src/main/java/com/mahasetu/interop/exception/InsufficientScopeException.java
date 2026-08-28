package com.mahasetu.interop.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
@ResponseStatus(HttpStatus.FORBIDDEN)
public class InsufficientScopeException extends RuntimeException {

    private final String errorCode;
    private final String requestId;

    public InsufficientScopeException(String message) {
        super(message);
        this.errorCode = "INSUFFICIENT_SCOPE";
        this.requestId = null;
    }

    public InsufficientScopeException(String message, String requestId) {
        super(message);
        this.errorCode = "INSUFFICIENT_SCOPE";
        this.requestId = requestId;
    }
}
