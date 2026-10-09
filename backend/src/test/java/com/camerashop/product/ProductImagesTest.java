package com.camerashop.product;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import com.camerashop.TestcontainersConfig;
import com.camerashop.entity.Product;
import com.camerashop.repository.ProductRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
class ProductImagesTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ProductRepository productRepository;

    @Test
    void detailReturnsGalleryOfTheRightProduct() throws Exception {
        mockMvc.perform(get("/api/products/" + idOf("Sony Alpha 7 IV")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.images.length()").value(greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.images[*]").value(everyItem(startsWith("/products/sony-alpha-7-iv/"))))
                .andExpect(jsonPath("$.imageUrl").value(startsWith("/products/sony-alpha-7-iv/0-")))
                .andExpect(jsonPath("$.specs[0].label").value("Cảm biến"))
                .andExpect(jsonPath("$.specs[0].value").value("Full-frame 33MP Exmor R"));
    }

    @Test
    void oldSampleProductsWereReplaced() {
        List<String> names = productRepository.findAll().stream().map(Product::getName).toList();
        assertTrue(names.containsAll(List.of("Sony Alpha 7C II", "Sony ZV-E10 II", "Nikon Z5 II", "Nikon Z50 II")));
        assertTrue(names.stream().noneMatch(n -> n.equals("Sony Alpha 7 III") || n.equals("Sony ZV-E10")
                || n.equals("Nikon Z5") || n.startsWith("Pin Nikon")));
    }

    @Test
    void batteryCompatibilityFollowsTheNewModel() throws Exception {
        mockMvc.perform(get("/api/products/" + idOf("Pin Sony NP-FW50")))
                .andExpect(jsonPath("$.compatibleProducts[*].name").value(contains("Sony Alpha 6400")));
        mockMvc.perform(get("/api/products/" + idOf("Sony ZV-E10 II")))
                .andExpect(jsonPath("$.compatibleProducts[*].name").value(hasItems("Pin Sony NP-FZ100", "Sạc Sony BC-QZ1")))
                .andExpect(jsonPath("$.compatibleProducts[*].name").value(not(hasItem("Pin Sony NP-FW50"))));
    }

    private Long idOf(String name) {
        return productRepository.findAll().stream()
                .filter(p -> p.getName().equals(name))
                .findFirst().orElseThrow().getId();
    }
}
