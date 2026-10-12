// Enables @Async so slow work (e.g. sending emails) runs off the request thread.

package com.camerashop.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
}
