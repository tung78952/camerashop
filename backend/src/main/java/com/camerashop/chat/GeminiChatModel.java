package com.camerashop.chat;

import java.time.Duration;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.camerashop.exception.ChatUnavailableException;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class GeminiChatModel implements ChatModel {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GeminiChatModel(@Value("${app.gemini.api-key}") String apiKey,
                           @Value("${app.gemini.model}") String model,
                           @Value("${app.gemini.base-url}") String baseUrl) {
        SimpleClientHttpRequestFactory timeouts = new SimpleClientHttpRequestFactory();
        timeouts.setConnectTimeout(Duration.ofSeconds(5));
        timeouts.setReadTimeout(Duration.ofSeconds(30));
        this.restClient = RestClient.builder().baseUrl(baseUrl).requestFactory(timeouts).build();
        this.apiKey = apiKey;
        this.model = model;
    }

    record Part(String text, Boolean thought) {
    }

    record Content(String role, List<Part> parts) {
    }

    record SystemInstruction(List<Part> parts) {
    }

    record GenerationConfig(double temperature, int maxOutputTokens) {
    }

    record GeminiRequest(SystemInstruction systemInstruction, List<Content> contents, GenerationConfig generationConfig) {
    }

    record Candidate(Content content) {
    }

    record GeminiResponse(List<Candidate> candidates) {
    }

    @Override
    public String generate(String systemPrompt, List<ChatTurn> turns) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ChatUnavailableException("Trợ lý AI chưa được cấu hình (thiếu GEMINI_API_KEY)");
        }

        List<Content> contents = turns.stream()
                .map(turn -> new Content(turn.fromUser() ? "user" : "model", List.of(new Part(turn.text(), null))))
                .toList();
        GeminiRequest body = new GeminiRequest(
                new SystemInstruction(List.of(new Part(systemPrompt, null))),
                contents,
                new GenerationConfig(0.4, 1024));

        try {
            GeminiResponse response = restClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GeminiResponse.class);
            String text = extractText(response);
            if (text.isBlank()) {
                throw new ChatUnavailableException("Trợ lý AI chưa trả lời được câu này, bạn thử hỏi cách khác nhé");
            }
            return text;
        } catch (HttpClientErrorException.TooManyRequests ex) {
            throw new ChatUnavailableException("Trợ lý AI đang quá tải, bạn thử lại sau ít phút nhé");
        } catch (RestClientException ex) {
            log.warn("Gọi Gemini lỗi: {}", ex.getMessage());
            throw new ChatUnavailableException("Trợ lý AI tạm thời không trả lời được, bạn thử lại sau nhé");
        }
    }

    private static String extractText(GeminiResponse response) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            return "";
        }
        Content content = response.candidates().get(0).content();
        if (content == null || content.parts() == null) {
            return "";
        }
        StringBuilder text = new StringBuilder();
        for (Part part : content.parts()) {
            if (part.text() != null && !Boolean.TRUE.equals(part.thought())) {
                text.append(part.text());
            }
        }
        return text.toString().trim();
    }
}
