// Admin image upload: validate type/size/content, normalize to a 720x720 white canvas (never upscaled), store with a content-hash name.

package com.camerashop.service;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Set;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.MemoryCacheImageOutputStream;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.camerashop.exception.BadRequestException;
import com.camerashop.storage.ImageStorage;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageService {

    private static final long MAX_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png");
    private static final int CANVAS = 720;
    private static final int TARGET = 500;
    private static final int WHITE_THRESHOLD = 18;

    private final ImageStorage imageStorage;

    // Validates, normalizes and stores one image; returns its public path.
    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Chưa chọn ảnh");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("Ảnh tối đa 5 MB");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Chỉ nhận ảnh JPG hoặc PNG");
        }
        BufferedImage source = read(file);

        byte[] jpeg = toJpeg(normalize(source));
        return imageStorage.save(sha256(jpeg).substring(0, 16) + ".jpg", jpeg);
    }

    // Decodes the file to make sure it really is an image.
    private static BufferedImage read(MultipartFile file) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(file.getBytes()));
            if (image == null) {
                throw new BadRequestException("File không phải ảnh hợp lệ");
            }
            return image;
        } catch (IOException ex) {
            throw new BadRequestException("Không đọc được ảnh");
        }
    }

    // Flattens transparency, crops white borders, downsizes and centers the product.
    private static BufferedImage normalize(BufferedImage source) {
        BufferedImage rgb = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D flat = rgb.createGraphics();
        flat.setColor(Color.WHITE);
        flat.fillRect(0, 0, rgb.getWidth(), rgb.getHeight());
        flat.drawImage(source, 0, 0, null);
        flat.dispose();

        int[] box = productBox(rgb);
        BufferedImage product = rgb.getSubimage(box[0], box[1], box[2], box[3]);

        double scale = Math.min(1.0, (double) TARGET / Math.max(box[2], box[3]));
        int w = Math.max(1, (int) Math.round(box[2] * scale));
        int h = Math.max(1, (int) Math.round(box[3] * scale));
        BufferedImage resized = resize(product, w, h);

        BufferedImage canvas = new BufferedImage(CANVAS, CANVAS, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = canvas.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, CANVAS, CANVAS);
        g.drawImage(resized, (CANVAS - w) / 2, (CANVAS - h) / 2, null);
        g.dispose();
        return canvas;
    }

    // Smallest rectangle containing all non-white pixels.
    private static int[] productBox(BufferedImage image) {
        int minX = image.getWidth(), minY = image.getHeight(), maxX = -1, maxY = -1;
        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                int rgb = image.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF, gr = (rgb >> 8) & 0xFF, b = rgb & 0xFF;
                if (255 - Math.min(r, Math.min(gr, b)) > WHITE_THRESHOLD) {
                    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                }
            }
        }
        if (maxX < 0) {
            return new int[] {0, 0, image.getWidth(), image.getHeight()};
        }
        return new int[] {minX, minY, maxX - minX + 1, maxY - minY + 1};
    }

    // Step-wise downscaling for sharper results.
    private static BufferedImage resize(BufferedImage image, int width, int height) {
        BufferedImage current = image;
        int w = image.getWidth(), h = image.getHeight();
        while (w / 2 >= width && h / 2 >= height) {
            w /= 2; h /= 2;
            current = draw(current, w, h);
        }
        return (w == width && h == height) ? current : draw(current, width, height);
    }

    private static BufferedImage draw(BufferedImage image, int width, int height) {
        BufferedImage out = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.drawImage(image, 0, 0, width, height, null);
        g.dispose();
        return out;
    }

    // Encodes as 90% quality JPEG.
    private static byte[] toJpeg(BufferedImage image) {
        try (ByteArrayOutputStream bytes = new ByteArrayOutputStream();
             MemoryCacheImageOutputStream output = new MemoryCacheImageOutputStream(bytes)) {
            ImageWriter writer = ImageIO.getImageWritersByFormatName("jpg").next();
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(0.9f);
            writer.setOutput(output);
            writer.write(null, new IIOImage(image, null, null), param);
            writer.dispose();
            output.flush();
            return bytes.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Không ghi được ảnh JPEG", ex);
        }
    }

    // Content hash used as the file name (same image = same name, new image = new URL).
    private static String sha256(byte[] data) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(data));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }
}
