package de.jan.mail;

import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Component
public class MailTemplates {

    private final SpringTemplateEngine engine = new SpringTemplateEngine();

    public MailTemplates() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/mail/");
        resolver.setCharacterEncoding("UTF-8");
        resolver.setTextTemplateModePatterns(Set.of("*.txt"));
        engine.setTemplateResolver(resolver);
    }

    String html(MailTemplate template, Map<String, Object> variables) {
        return engine.process(template.fileName() + ".html", new Context(Locale.GERMAN, variables));
    }

    /** With \n as line break, however git checked out the template. */
    String text(MailTemplate template, Map<String, Object> variables) {
        return engine.process(template.fileName() + ".txt", new Context(Locale.GERMAN, variables)).replace("\r\n", "\n");
    }
}
