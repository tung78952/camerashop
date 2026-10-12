package com.camerashop.mail;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "smtp", matchIfMissing = true)
@RequiredArgsConstructor
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;

    @Override
    public void send(String from, String to, String subject, String text) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(from);
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(text);
        try {
            mailSender.send(mail);
        } catch (MailException ex) {
            throw new EmailSendException("SMTP lỗi: " + ex.getMessage(), ex);
        }
    }
}
