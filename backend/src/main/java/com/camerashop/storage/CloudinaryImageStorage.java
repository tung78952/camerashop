// Stores images on Cloudinary via its signed upload API (enabled with IMAGE_STORAGE=cloudinary).

package com.camerashop.storage;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@ConditionalOnProperty(name = "app.storage", havingValue = "cloudinary")
public class CloudinaryImageStorage implements ImageStorage {

    private final RestClient restClient = RestClient.create("https://api.cloudinary.com/v1_1");
    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;

    public CloudinaryImageStorage(@Value("${app.cloudinary.cloud-name}") String cloudName,
                                  @Value("${app.cloudinary.api-key}") String apiKey,
                                  @Value("${app.cloudinary.api-secret}") String apiSecret) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    record UploadResult(String secure_url) {
    }

    @Override
    public String save(String fileName, byte[] content) {
        String publicId = "camerashop/uploads/" + fileName.replaceFirst("\\.jpg$", "");
        long timestamp = Instant.now().getEpochSecond();
        String signature = sha1("overwrite=true&public_id=" + publicId + "&timestamp=" + timestamp + apiSecret);

        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("file", new ByteArrayResource(content) {
            @Override
            public String getFilename() {
                return fileName;
            }
        });
        form.add("api_key", apiKey);
        form.add("timestamp", String.valueOf(timestamp));
        form.add("public_id", publicId);
        form.add("overwrite", "true");
        form.add("signature", signature);

        try {
            UploadResult result = restClient.post()
                    .uri("/{cloud}/image/upload", cloudName)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(form)
                    .retrieve()
                    .body(UploadResult.class);
            if (result == null || result.secure_url() == null) {
                throw new IllegalStateException("Cloudinary không trả về đường dẫn ảnh");
            }
            return result.secure_url();
        } catch (RestClientException ex) {
            throw new IllegalStateException("Không tải được ảnh lên Cloudinary", ex);
        }
    }

    private static String sha1(String text) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-1").digest(text.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }
}
