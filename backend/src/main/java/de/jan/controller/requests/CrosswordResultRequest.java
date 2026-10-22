package de.jan.controller.requests;

/**
 * The end of a crossword: solved without help, or finished with "Feld aufdecken" or "Lösung zeigen".
 *
 * @param script     "hiragana" or "katakana"
 * @param level      the level it was played at, "A1" to "C2"
 * @param solved     true if it was solved without help, false (or missing) if squares or the solution were shown
 * @param rightWords words the user got right without having them shown; missing counts as 0
 */
public record CrosswordResultRequest(String script, String level, Boolean solved, Integer rightWords) {
}
