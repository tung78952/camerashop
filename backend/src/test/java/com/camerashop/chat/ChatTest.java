package com.camerashop.chat;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.camerashop.TestcontainersConfig;
import com.camerashop.chat.CatalogRetriever.CatalogItem;
import com.camerashop.chat.CatalogRetriever.Retrieval;

@SpringBootTest(properties = {"app.chat.per-minute=3", "app.chat.per-day=100", "app.chat.global-per-day=1000"})
@AutoConfigureMockMvc
@Import({TestcontainersConfig.class, ChatTest.FakeModelConfig.class})
class ChatTest {

    private static final BigDecimal MILLION = BigDecimal.valueOf(1_000_000);

    @Autowired private MockMvc mockMvc;
    @Autowired private CatalogRetriever retriever;
    @Autowired private FakeChatModel fakeModel;

    static class FakeChatModel implements ChatModel {
        String lastSystemPrompt;

        @Override
        public String generate(String systemPrompt, List<ChatTurn> turns) {
            lastSystemPrompt = systemPrompt;
            int start = systemPrompt.indexOf("\n- ");
            if (start < 0) {
                return "Shop chưa có món phù hợp, bạn cho mình biết thêm nhu cầu nhé.";
            }
            String name = systemPrompt.substring(start + 3, systemPrompt.indexOf(" |", start));
            return "**Gợi ý:**\n- " + name + ": hợp nhu cầu của bạn.";
        }
    }

    @TestConfiguration
    static class FakeModelConfig {
        @Bean
        @Primary
        FakeChatModel fakeChatModel() {
            return new FakeChatModel();
        }
    }

    @Test
    void findsCamerasWithinBudgetAndRanksVlogFirst() {
        Retrieval result = retriever.retrieve("Máy ảnh dưới 25 triệu để quay vlog", null);

        assertEquals("Máy ảnh", result.need().category());
        assertEquals(0, result.need().maxBudget().compareTo(BigDecimal.valueOf(25).multiply(MILLION)));
        assertFalse(result.items().isEmpty());
        for (CatalogItem item : result.items()) {
            assertEquals("Máy ảnh", item.category());
            assertTrue(item.minPrice().compareTo(BigDecimal.valueOf(25).multiply(MILLION)) <= 0, item.name());
        }
        assertEquals("Sony ZV-E10 II", result.items().get(0).name());
        assertTrue(result.items().stream().noneMatch(item -> item.name().equals("Sony Alpha 7 IV")));
    }

    @Test
    void findsLensesForTheCameraTheCustomerOwns() {
        Retrieval result = retriever.retrieve("ong kinh chup chan dung cho a7 iv", null);

        assertEquals("Sony Alpha 7 IV", result.need().forCamera());
        assertTrue(result.items().stream().allMatch(item -> "Sony E".equals(item.mount()) && item.category().equals("Ống kính")));
        assertTrue(result.items().get(0).name().contains("F1.8"), result.items().get(0).name());
    }

    @Test
    void findsBatteryCompatibleWithMentionedCamera() {
        Retrieval result = retriever.retrieve("pin dự phòng cho máy ảnh Canon R50", null);

        assertEquals("Pin & sạc", result.need().category());
        assertEquals(List.of("Pin Canon LP-E17"), result.items().stream().map(item -> item.name()).toList());
    }

    @Test
    void relaxesBudgetWhenNothingFits() {
        Retrieval result = retriever.retrieve("máy ảnh dưới 5 triệu", null);

        assertTrue(result.relaxedBudget());
        assertEquals("Canon EOS R50", result.items().get(0).name());
    }

    @Test
    void followUpQuestionKeepsContext() {
        Retrieval result = retriever.retrieve("còn hãng Canon thì sao?", "máy ảnh tầm 35 triệu");

        assertEquals("Máy ảnh", result.need().category());
        assertTrue(result.items().stream().allMatch(item -> item.brand().equals("Canon") && item.category().equals("Máy ảnh")));
    }

    @Test
    void endpointAnswersWithProductCards() throws Exception {
        mockMvc.perform(post("/api/chat").header("X-Forwarded-For", "10.0.0.1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"Máy ảnh dưới 25 triệu để quay vlog\",\"history\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value("Gợi ý:\n• Sony ZV-E10 II: hợp nhu cầu của bạn."))
                .andExpect(jsonPath("$.products[0].name").value("Sony ZV-E10 II"))
                .andExpect(jsonPath("$.products[0].minPrice").value(23990000));

        assertTrue(fakeModel.lastSystemPrompt.contains("CHỈ giới thiệu sản phẩm có trong mục"));
        assertTrue(fakeModel.lastSystemPrompt.contains("23.990.000đ"));
    }

    @Test
    void blankQuestionIsRejected() throws Exception {
        mockMvc.perform(post("/api/chat").header("X-Forwarded-For", "10.0.0.2")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"   \"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void tooManyQuestionsPerMinuteAreRejected() throws Exception {
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/chat").header("X-Forwarded-For", "10.0.0.3")
                            .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"xin chào\"}"))
                    .andExpect(status().isOk());
        }
        mockMvc.perform(post("/api/chat").header("X-Forwarded-For", "10.0.0.3")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"message\":\"xin chào\"}"))
                .andExpect(status().isTooManyRequests());
    }
}
