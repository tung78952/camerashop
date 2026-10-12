// Admin product management endpoints (list, get, create, update, hide/unhide).

package com.camerashop.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.camerashop.dto.admin.AdminProductDetailDTO;
import com.camerashop.dto.admin.AdminProductRowDTO;
import com.camerashop.dto.admin.ProductFormDTO;
import com.camerashop.service.AdminProductService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    public record ActiveDTO(@NotNull(message = "Thiếu trạng thái active") Boolean active) {
    }

    @GetMapping
    public List<AdminProductRowDTO> list() {
        return adminProductService.list();
    }

    @GetMapping("/{id}")
    public AdminProductDetailDTO get(@PathVariable Long id) {
        return adminProductService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductDetailDTO create(@Valid @RequestBody ProductFormDTO form) {
        return adminProductService.create(form);
    }

    @PutMapping("/{id}")
    public AdminProductDetailDTO update(@PathVariable Long id, @Valid @RequestBody ProductFormDTO form) {
        return adminProductService.update(id, form);
    }

    @PatchMapping("/{id}/active")
    public AdminProductDetailDTO setActive(@PathVariable Long id, @Valid @RequestBody ActiveDTO body) {
        return adminProductService.setActive(id, body.active());
    }
}
