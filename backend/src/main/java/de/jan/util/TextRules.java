package de.jan.util;

import de.jan.exceptions.EntityStateException;

/**
 * Checks of text from requests, with the same messages everywhere; a failed check is answered with 400.
 * The text is cleaned up before, see TextCleaner.
 */
public final class TextRules {

    private TextRules() {

    }

    /** Neither empty nor too long, e.g. "Title must not be empty", "Title must be at most 150 characters long". */
    public static void require(String value, String label, int maxLength) {
        if (value == null || value.isEmpty()) {
            throw new EntityStateException(label + " must not be empty");
        }
        requireMaxLength(value, label, maxLength);
    }

    /** At most maxLength characters; empty is fine. */
    public static void requireMaxLength(String value, String label, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new EntityStateException(label + " must be at most " + maxLength + " characters long");
        }
    }
}
