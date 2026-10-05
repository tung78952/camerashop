package com.camerashop.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.dto.product.FilterOptionsDTO;
import com.camerashop.service.FilterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class FilterController {

    private final FilterService filterService;

    @GetMapping("/api/filters")
    public FilterOptionsDTO getFilterOptions() {
        return filterService.getFilterOptions();
    }
}
