package com.camerashop.chat;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.camerashop.exception.TooManyRequestsException;

@Component
public class ChatRateLimiter {

    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");

    private final int perMinute;
    private final int perDay;
    private final int globalPerDay;

    private final Map<String, Deque<Instant>> lastMinute = new HashMap<>();
    private final Map<String, Integer> todayByClient = new HashMap<>();
    private int todayTotal = 0;
    private LocalDate today = LocalDate.now(VIETNAM);

    public ChatRateLimiter(@Value("${app.chat.per-minute}") int perMinute,
                           @Value("${app.chat.per-day}") int perDay,
                           @Value("${app.chat.global-per-day}") int globalPerDay) {
        this.perMinute = perMinute;
        this.perDay = perDay;
        this.globalPerDay = globalPerDay;
    }

    public synchronized void check(String clientKey) {
        Instant now = Instant.now();
        LocalDate date = LocalDate.now(VIETNAM);
        if (!date.equals(today)) {
            today = date;
            todayTotal = 0;
            todayByClient.clear();
            lastMinute.clear();
        }

        if (todayTotal >= globalPerDay) {
            throw new TooManyRequestsException("Trợ lý AI đã hết lượt trả lời hôm nay, bạn quay lại vào ngày mai nhé");
        }
        if (todayByClient.getOrDefault(clientKey, 0) >= perDay) {
            throw new TooManyRequestsException("Bạn đã hỏi nhiều câu hôm nay, quay lại vào ngày mai nhé");
        }
        Deque<Instant> recent = lastMinute.computeIfAbsent(clientKey, key -> new ArrayDeque<>());
        while (!recent.isEmpty() && recent.peekFirst().isBefore(now.minusSeconds(60))) {
            recent.pollFirst();
        }
        if (recent.size() >= perMinute) {
            throw new TooManyRequestsException("Bạn hỏi hơi nhanh, đợi khoảng 1 phút rồi hỏi tiếp nhé");
        }

        recent.addLast(now);
        todayByClient.merge(clientKey, 1, (old, add) -> old + add);
        todayTotal++;
    }
}
