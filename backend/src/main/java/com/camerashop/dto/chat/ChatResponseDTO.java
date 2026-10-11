package com.camerashop.dto.chat;

import java.math.BigDecimal;
import java.util.List;

public record ChatResponseDTO(
        String reply,
        List<ChatProductDTO> products) {

    public record ChatProductDTO(Long id, String name, String imageUrl, BigDecimal minPrice) {
    }
}
