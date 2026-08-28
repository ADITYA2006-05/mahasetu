package com.mahasetu.interop.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class ServiceUnavailableException extends RuntimeException {
    private final String departmentCode;

    public ServiceUnavailableException(String departmentCode, String message) {
        super(message);
        this.departmentCode = departmentCode;
    }
}
