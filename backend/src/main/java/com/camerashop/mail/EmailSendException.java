// Email delivery failure; callers log it without failing the order.

package com.camerashop.mail;

public class EmailSendException extends RuntimeException {

    public EmailSendException(String message, Throwable cause) {
        super(message, cause);
    }
}
