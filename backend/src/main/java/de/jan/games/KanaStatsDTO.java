package de.jan.games;

import java.util.List;

/**
 * The "Kana lesen" statistics of the logged-in user, as the frontend gets them.
 *
 * @param rounds        rounds played to the end
 * @param perfectRounds rounds with every character right
 * @param currentStreak characters read right in a row
 */
public record KanaStatsDTO(int rounds, int perfectRounds, int rightKana, int askedKana,
                           int currentStreak, int bestStreak, List<ScriptStats> scripts) {

    /** the numbers of one script ("hiragana", "katakana"); only scripts the user has been asked are listed */
    public record ScriptStats(String script, int rightKana, int askedKana) { }
}
