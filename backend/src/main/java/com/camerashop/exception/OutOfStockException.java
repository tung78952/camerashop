// Not enough stock -> HTTP 409.

package com.camerashop.exception;

public class OutOfStockException extends RuntimeException {

    public OutOfStockException(String message) {
        super(message);
    }
}
