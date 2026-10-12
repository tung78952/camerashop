// Brevo transactional email API sender (MAIL_PROVIDER=brevo), used in production where SMTP ports are blocked.

package com.camerashop.mail;

import java.time.Duration;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.annotation.JsonInclude;

@Component
@ConditionalOnProperty(name = "app.mail.provider", havingValue = "brevo")
public class BrevoEmailSender implements EmailSender {

    private static final Pattern NAME_AND_EMAIL = Pattern.compile("^\\s*(.*?)\\s*<\\s*([^>]+?)\\s*>\\s*$");

    private final RestClient restClient;
    private final String apiKey;

    public BrevoEmailSender(@Value("${app.brevo.api-key}") String apiKey,
                            @Value("${app.brevo.base-url}") String baseUrl) {
        SimpleClientHttpRequestFactory timeouts = new SimpleClientHttpRequestFactory();
        timeouts.setConnectTimeout(Duration.ofSeconds(5));
        timeouts.setReadTimeout(Duration.ofSeconds(15));
        this.restClient = RestClient.builder().baseUrl(baseUrl).requestFactory(timeouts).build();
        this.apiKey = apiKey;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    record Contact(String name, String email) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    record BrevoEmail(Contact sender, List<Contact> to, String subject, String textContent, String htmlContent) {
    }

    @Override
    public void send(String from, String to, String subject, String text, String html) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new EmailSendException("Thiếu BREVO_API_KEY", null);
        }
        BrevoEmail body = new BrevoEmail(parse(from), List.of(new Contact(null, to)), subject, text, html);
        try {
            restClient.post()
                    .uri("/v3/smtp/email")
                    .header("api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException ex) {
            throw new EmailSendException("Brevo lỗi: " + ex.getMessage(), ex);
        }
    }

    // Splits "Name <email>" into name and address.
    static Contact parse(String from) {
        Matcher m = NAME_AND_EMAIL.matcher(from);
        if (m.matches()) {
            return new Contact(m.group(1).isBlank() ? null : m.group(1), m.group(2));
        }
        return new Contact(null, from.trim());
    }
}
