package de.jan.config;

import de.jan.image.ImageRepository;
import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

@Configuration
public class ImageStorageConfig {

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(DataSize.ofBytes(ImageRepository.MAX_SIZE_BYTES));
        // image + multipart overhead
        factory.setMaxRequestSize(DataSize.ofBytes(ImageRepository.MAX_SIZE_BYTES + 64 * 1024));
        return factory.createMultipartConfig();
    }
}
