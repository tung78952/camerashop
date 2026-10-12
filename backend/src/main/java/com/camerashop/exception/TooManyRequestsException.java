// Chat rate limit exceeded -> HTTP 429.

package com.camerashop.exception;

public class TooManyRequestsException extends RuntimeException {

    public TooManyRequestsException(String message) {
        super(message);
    }
}
