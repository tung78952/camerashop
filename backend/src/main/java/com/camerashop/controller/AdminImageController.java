// Admin image upload endpoint (multipart).

package com.camerashop.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.camerashop.service.ImageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/images")
@RequiredArgsConstructor
public class AdminImageController {

    private final ImageService imageService;

    public record ImageUrlDTO(String url) {
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ImageUrlDTO upload(@RequestParam("file") MultipartFile file) {
        return new ImageUrlDTO(imageService.upload(file));
    }
}
