package com.camerashop.mail;

import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

@Component
public class MailTemplateRenderer {

    public record RenderedMail(String text, String html) {
    }

    private final TemplateEngine engine = new TemplateEngine();

    public MailTemplateRenderer() {
        engine.addTemplateResolver(resolver(".html", TemplateMode.HTML, 1));
        engine.addTemplateResolver(resolver(".txt", TemplateMode.TEXT, 2));
    }

    private static ClassLoaderTemplateResolver resolver(String suffix, TemplateMode mode, int order) {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/mail/");
        resolver.setSuffix("");
        resolver.setResolvablePatterns(Set.of("*" + suffix));
        resolver.setTemplateMode(mode);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setOrder(order);
        resolver.setCacheable(true);
        return resolver;
    }

    public RenderedMail render(String template, Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);
        return new RenderedMail(
                engine.process(template + ".txt", context),
                engine.process(template + ".html", context));
    }
}
