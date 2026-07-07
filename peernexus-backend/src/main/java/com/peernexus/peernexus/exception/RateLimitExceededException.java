package com.peernexus.peernexus.exception;

/**
 * Exception thrown when the user or API rate limit is exceeded.
 * Maps to HTTP 429 Too Many Requests.
 */
public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException(String message) {
        super(message);
    }
}
