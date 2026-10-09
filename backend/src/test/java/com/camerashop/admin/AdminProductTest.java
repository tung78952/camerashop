package com.camerashop.admin;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.matchesPattern;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import com.camerashop.TestcontainersConfig;
import com.camerashop.repository.BrandRepository;
import com.camerashop.repository.CategoryRepository;
import com.camerashop.repository.MountRepository;

@SpringBootTest(properties = "app.upload.dir=target/test-uploads")
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
class AdminProductTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private BrandRepository brandRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private MountRepository mountRepository;

    @Test
    void uploadedImageIsNormalizedWithoutUpscaling() throws Exception {
        String url = upload(adminToken(), pngWithBlackBox(300, 200, 100, 60));
        assertTrue(url.matches("/uploads/products/[0-9a-f]{16}\\.jpg"), url);

        byte[] served = mockMvc.perform(get(url)).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsByteArray();
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(served));
        assertEquals(720, image.getWidth());
        assertEquals(720, image.getHeight());
        int[] box = darkBox(image);
        assertTrue(Math.abs(box[0] - 100) <= 2 && Math.abs(box[1] - 60) <= 2, "sản phẩm phải giữ ~100x60, thực tế " + box[0] + "x" + box[1]);
    }

    @Test
    void nonImageFilesAreRejected() throws Exception {
        String admin = adminToken();
        mockMvc.perform(multipart("/api/admin/images")
                        .file(new MockMultipartFile("file", "virus.txt", "text/plain", "hello".getBytes()))
                        .header("Authorization", "Bearer " + admin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Chỉ nhận ảnh JPG hoặc PNG"));
        mockMvc.perform(multipart("/api/admin/images")
                        .file(new MockMultipartFile("file", "fake.png", "image/png", "not really a png".getBytes()))
                        .header("Authorization", "Bearer " + admin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("File không phải ảnh hợp lệ"));
    }

    @Test
    void createEditAndHideProduct() throws Exception {
        String admin = adminToken();
        String image = upload(admin, pngWithBlackBox(400, 400, 300, 200));
        String name = "Sony Alpha 7 V " + UUID.randomUUID().toString().substring(0, 8);
        String sku = "TEST-A7V-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String created = mockMvc.perform(post("/api/admin/products").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(form(name, image, "[" + variant(null, "Body only", sku, 64990000, 5) + "]")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.images[0]").value(image))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        long id = number(created, "id");
        long bodyId = number(created.substring(created.indexOf("\"variants\"")), "id");

        mockMvc.perform(get("/api/products").param("q", name))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].minPrice").value(64990000))
                .andExpect(jsonPath("$.items[0].imageUrl").value(image));

        mockMvc.perform(put("/api/admin/products/" + id).header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(form(name, image, "[" + variant(bodyId, "Body only", sku, 62990000, 5) + ","
                                + variant(null, "Kit 28-70mm", sku + "-KIT", 69990000, 3) + "]")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.variants.length()").value(2));
        mockMvc.perform(get("/api/products/" + id))
                .andExpect(jsonPath("$.specs[0].label").value("Cảm biến"))
                .andExpect(jsonPath("$.specs[1].value").value("Sony E"))
                .andExpect(jsonPath("$.variants[0].price").value(62990000))
                .andExpect(jsonPath("$.variants[1].name").value("Kit 28-70mm"));

        mockMvc.perform(patch("/api/admin/products/" + id + "/active").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"active\":false}"))
                .andExpect(jsonPath("$.active").value(false));
        mockMvc.perform(get("/api/products/" + id)).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/products").param("q", name)).andExpect(jsonPath("$.totalItems").value(0));
        mockMvc.perform(post("/api/cart/items").header("Authorization", "Bearer " + customerToken())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"variantId\":" + bodyId + ",\"quantity\":1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Sản phẩm này đã ngừng bán"));
        mockMvc.perform(get("/api/admin/products").header("Authorization", "Bearer " + admin))
                .andExpect(jsonPath("$[?(@.id == " + id + ")].active").value(false));
    }

    @Test
    void invalidFormsAreRejected() throws Exception {
        String admin = adminToken();
        mockMvc.perform(post("/api/admin/products").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(form("Trùng SKU", null, "[" + variant(null, "Body", "SONY-A7IV-BODY", 1000, 1) + "]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("SKU SONY-A7IV-BODY đã được dùng cho sản phẩm khác"));
        mockMvc.perform(post("/api/admin/products").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(form("Giá âm", null, "[" + variant(null, "Body", "TEST-NEGATIVE", -1, 1) + "]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Giá không được âm"));
    }

    @Test
    void orderedVariantCannotBeDeleted() throws Exception {
        String admin = adminToken();
        String sku = "TEST-ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String created = mockMvc.perform(post("/api/admin/products").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(form("Máy thử đơn " + sku, null, "[" + variant(null, "Body", sku, 1000000, 5) + ","
                                + variant(null, "Kit", sku + "-KIT", 2000000, 5) + "]")))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        long id = number(created, "id");
        String variants = created.substring(created.indexOf("\"variants\""));
        long bodyId = number(variants, "id");
        long kitId = number(variants.substring(variants.indexOf("\"id\"") + 4), "id");

        String customer = customerToken();
        mockMvc.perform(post("/api/cart/items").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON).content("{\"variantId\":" + kitId + ",\"quantity\":1}"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/orders").header("Authorization", "Bearer " + customer)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"receiverName\":\"Khách\",\"phone\":\"0901234567\",\"address\":\"1 Lê Lợi\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(put("/api/admin/products/" + id).header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(form("Máy thử đơn " + sku, null, "[" + variant(bodyId, "Body", sku, 1000000, 5) + "]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("đã có trong đơn hàng")));
    }

    @Test
    void customerCannotManageProducts() throws Exception {
        String customer = customerToken();
        mockMvc.perform(get("/api/admin/products").header("Authorization", "Bearer " + customer))
                .andExpect(status().isForbidden());
        mockMvc.perform(multipart("/api/admin/images").file(pngFile(pngWithBlackBox(50, 50, 20, 20)))
                        .header("Authorization", "Bearer " + customer))
                .andExpect(status().isForbidden());
    }

    private String form(String name, String image, String variantsJson) {
        Long sony = brandRepository.findAll().stream().filter(b -> b.getName().equals("Sony")).findFirst().orElseThrow().getId();
        Long camera = categoryRepository.findAll().stream().filter(c -> c.getName().equals("Máy ảnh")).findFirst().orElseThrow().getId();
        Long sonyE = mountRepository.findAll().stream().filter(m -> m.getName().equals("Sony E")).findFirst().orElseThrow().getId();
        String images = image == null ? "[]" : "[\"" + image + "\"]";
        return """
                {"name":"%s","description":"Máy thử","brandId":%d,"categoryId":%d,"mountId":%d,"images":%s,"variants":%s,
                 "specs":[{"label":"Cảm biến","value":"Full-frame 33MP"},{"label":"Ngàm","value":"Sony E"}]}
                """.formatted(name, sony, camera, sonyE, images, variantsJson);
    }

    private static String variant(Long id, String name, String sku, long price, int stock) {
        return """
                {"id":%s,"name":"%s","sku":"%s","price":%d,"stock":%d}""".formatted(id, name, sku, price, stock);
    }

    private String upload(String token, byte[] png) throws Exception {
        String body = mockMvc.perform(multipart("/api/admin/images").file(pngFile(png)).header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.url").value(matchesPattern("/uploads/products/.+")))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        Matcher m = Pattern.compile("\"url\":\"([^\"]+)\"").matcher(body);
        assertTrue(m.find());
        return m.group(1);
    }

    private static MockMultipartFile pngFile(byte[] png) {
        return new MockMultipartFile("file", "anh.png", "image/png", png);
    }

    private static byte[] pngWithBlackBox(int width, int height, int boxW, int boxH) throws Exception {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.WHITE); g.fillRect(0, 0, width, height);
        g.setColor(Color.BLACK); g.fillRect((width - boxW) / 2, (height - boxH) / 2, boxW, boxH);
        g.dispose();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return out.toByteArray();
    }

    private static int[] darkBox(BufferedImage image) {
        int minX = Integer.MAX_VALUE, minY = Integer.MAX_VALUE, maxX = -1, maxY = -1;
        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                if ((image.getRGB(x, y) & 0xFF) < 128) {
                    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                }
            }
        }
        return new int[] {maxX - minX + 1, maxY - minY + 1};
    }

    private String adminToken() throws Exception {
        return token(mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@camerashop.local\",\"password\":\"admin123\"}")).andReturn()
                .getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private String customerToken() throws Exception {
        String email = "khach-" + UUID.randomUUID() + "@test.local";
        return token(mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Khách\",\"email\":\"" + email + "\",\"password\":\"matkhau123\"}")).andReturn()
                .getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    private static String token(String json) {
        Matcher m = Pattern.compile("\"token\":\"([^\"]+)\"").matcher(json);
        assertTrue(m.find(), json);
        return m.group(1);
    }

    private static long number(String json, String key) {
        Matcher m = Pattern.compile("\"" + key + "\":(\\d+)").matcher(json);
        assertTrue(m.find(), json);
        return Long.parseLong(m.group(1));
    }
}
