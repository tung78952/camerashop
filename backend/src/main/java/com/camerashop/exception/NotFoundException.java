// Resource not found -> HTTP 404.

package com.camerashop.exception;

public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
