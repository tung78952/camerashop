package com.camerashop.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    private static final String BEARER = "bearerAuth";

    @Bean
    OpenAPI cameraShopOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("CameraShop API")
                        .version("1.0")
                        .description("""
                                API shop máy ảnh: sản phẩm, lọc, giỏ hàng, đặt hàng (chống bán lố), đơn hàng, admin.
                                Đăng nhập: POST /api/auth/login (demo@camerashop.local / demo123, admin@camerashop.local / admin123)
                                -> copy "token" -> bấm Authorize -> dán vào."""))
                .components(new Components().addSecuritySchemes(BEARER, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER));
    }
}
