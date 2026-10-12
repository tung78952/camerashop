// Authenticated but not allowed (e.g. reviewing a product you have not received) -> HTTP 403.

package com.camerashop.exception;

public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
