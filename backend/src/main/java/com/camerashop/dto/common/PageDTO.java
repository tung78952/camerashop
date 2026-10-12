// One page of results plus paging info for the frontend.

package com.camerashop.dto.common;

import java.util.List;

import org.springframework.data.domain.Page;

public record PageDTO<T>(
        List<T> items,
        int page,
        int size,
        long totalItems,
        int totalPages) {

    public static <T> PageDTO<T> from(Page<T> page) {
        return new PageDTO<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }
}
