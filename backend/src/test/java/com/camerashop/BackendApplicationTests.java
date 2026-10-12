// Smoke test: the Spring context starts against a real PostgreSQL container.

package com.camerashop;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfig.class)
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
