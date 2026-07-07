package com.peernexus.peernexus.exception;

/**
 * Exception thrown when the upstream API provider times out.
 * Maps to HTTP 504 Gateway Timeout.
 */
public class GatewayTimeoutException extends RuntimeException {

    public GatewayTimeoutException(String message) {
        super(message);
    }
}
