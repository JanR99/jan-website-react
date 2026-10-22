package de.jan.util;

import java.util.regex.Pattern;

/** Cleans up text from requests before it is checked and stored. */
public final class TextCleaner {

    private static final Pattern WHITESPACE = Pattern.compile("\\s+");
    private static final Pattern LINE_BREAK = Pattern.compile("\\r\\n?");
    private static final Pattern SPACES_AT_LINE_END = Pattern.compile("[ \\t]+\\n");
    private static final Pattern EMPTY_LINES = Pattern.compile("\\n{3,}");

    private TextCleaner() {
    }

    /** One line: trimmed, every run of whitespace (line breaks included) becomes a single space; null becomes "". */
    public static String collapse(String value) {
        return value == null ? "" : WHITESPACE.matcher(value.trim()).replaceAll(" ");
    }

    /** Keeps the line breaks: no spaces at the end of a line and at most one empty line between paragraphs. */
    public static String cleanText(String value) {
        if (value == null) {
            return "";
        }
        String text = LINE_BREAK.matcher(value).replaceAll("\n");
        text = SPACES_AT_LINE_END.matcher(text).replaceAll("\n");
        text = EMPTY_LINES.matcher(text).replaceAll("\n\n");
        return text.strip();
    }
}
