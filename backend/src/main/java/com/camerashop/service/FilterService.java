package com.camerashop.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.camerashop.dto.common.OptionDTO;
import com.camerashop.dto.product.FilterOptionsDTO;
import com.camerashop.repository.BrandRepository;
import com.camerashop.repository.CategoryRepository;
import com.camerashop.repository.MountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FilterService {

    private static final Sort BY_NAME = Sort.by("name");

    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final MountRepository mountRepository;

    public FilterOptionsDTO getFilterOptions() {
        List<OptionDTO> brands = brandRepository.findAll(BY_NAME).stream()
                .map(b -> new OptionDTO(b.getId(), b.getName()))
                .toList();
        List<OptionDTO> categories = categoryRepository.findAll(BY_NAME).stream()
                .map(c -> new OptionDTO(c.getId(), c.getName()))
                .toList();
        List<OptionDTO> mounts = mountRepository.findAll(BY_NAME).stream()
                .map(m -> new OptionDTO(m.getId(), m.getName()))
                .toList();
        return new FilterOptionsDTO(brands, categories, mounts);
    }
}
