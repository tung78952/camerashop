// Wrong credentials or missing login -> HTTP 401.

package com.camerashop.exception;

public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
