package de.jan.license;

import de.jan.controller.response.LicenseResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The libraries of the backend with their licenses. The license-maven-plugin writes them into
 * jan-website-third-party.txt while building (see pom.xml); started from an IDE without a Maven build, the list is empty.
 */
@Component
public class LicenseRepository {

    static final String RESOURCE = "/jan-website-third-party.txt";

    /** " (License A) (License B) Name (group:artifact:version - url)" */
    private static final Pattern LINE = Pattern.compile(
            "^\\s*((?:\\([^()]*\\)\\s*)+)(.*?)\\s+\\(([^:\\s()]+):([^:\\s()]+):(\\S+) - (.*)\\)\\s*$");
    private static final Pattern LICENSE = Pattern.compile("\\(([^()]*)\\)");
    private static final String NO_URL = "no url defined";

    private final List<LicenseResponse> licenses;

    public LicenseRepository() {
        this.licenses = load();
    }

    public List<LicenseResponse> getAll() {
        return licenses;
    }

    private static List<LicenseResponse> load() {
        try (InputStream in = LicenseRepository.class.getResourceAsStream(RESOURCE)) {
            return in == null ? List.of() : parse(new String(in.readAllBytes(), StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** The libraries in the file as the plugin writes it by default (format of its THIRD-PARTY.txt), by name; other lines are skipped. */
    static List<LicenseResponse> parse(String text) {
        List<LicenseResponse> result = new ArrayList<>();
        for (String line : text.split("\\R")) {
            Matcher matcher = LINE.matcher(line);
            if (!matcher.matches()) {
                continue;
            }
            List<String> names = new ArrayList<>();
            Matcher license = LICENSE.matcher(matcher.group(1));
            while (license.find()) {
                names.add(license.group(1).trim());
            }
            String url = matcher.group(6).trim();
            result.add(new LicenseResponse(
                    matcher.group(2).trim(),
                    matcher.group(3) + ":" + matcher.group(4),
                    matcher.group(5),
                    List.copyOf(names),
                    url.isEmpty() || url.equals(NO_URL) ? null : url));
        }
        result.sort((a, b) -> a.name().compareToIgnoreCase(b.name()));
        return List.copyOf(result);
    }
}
