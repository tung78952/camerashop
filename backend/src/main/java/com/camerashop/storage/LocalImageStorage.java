// Stores images on local disk under uploads/products (default for development).

package com.camerashop.storage;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.storage", havingValue = "local", matchIfMissing = true)
public class LocalImageStorage implements ImageStorage {

    private final Path productDir;

    public LocalImageStorage(@Value("${app.upload.dir}") String uploadDir) {
        this.productDir = Path.of(uploadDir).toAbsolutePath().resolve("products");
    }

    @Override
    public String save(String fileName, byte[] content) {
        try {
            Files.createDirectories(productDir);
            Files.write(productDir.resolve(fileName), content);
            return "/uploads/products/" + fileName;
        } catch (IOException ex) {
            throw new UncheckedIOException("Không lưu được ảnh " + fileName, ex);
        }
    }
}
