package de.jan.games.repository;

import de.jan.controller.requests.KanaResultRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.games.KanaMistake;
import de.jan.games.KanaMistakeDTO;
import de.jan.games.KanaStats;
import de.jan.games.KanaStatsDAO;
import de.jan.games.KanaStatsDTO;
import de.jan.user.User;
import de.jan.user.UserDataOwner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class KanaStatsRepository implements UserDataOwner {

    public static final String HIRAGANA = "hiragana";
    public static final String KATAKANA = "katakana";
    public static final List<String> SCRIPTS = List.of(HIRAGANA, KATAKANA);
    /** more characters than a round ever has */
    public static final int MAX_KANA = 20;
    /** the list of mistakes keeps at most this many characters, dropping the oldest */
    public static final int MAX_MISTAKES = 300;

    /** one character, or one with a small ゃ, ゅ or ょ after it; all hiragana or all katakana */
    private static final Pattern HIRAGANA_KANA = Pattern.compile("[\\u3041-\\u3096][ゃゅょ]?");
    private static final Pattern KATAKANA_KANA = Pattern.compile("[\\u30a1-\\u30fa][ャュョ]?");

    private final KanaStatsDAO statsDAO = new KanaStatsDAO();

    public KanaStatsDTO get(User user) {
        KanaStats stats = statsDAO.get(user.getId());
        return toDTO(stats != null ? stats : new KanaStats(user.getId()));
    }

    /**
     * Counts a round played to the end: the characters per script, the right ones, a perfect round if all were
     * right, and the streak of right characters, which goes on from round to round until a wrong one. Wrong
     * characters go on the list of mistakes and right ones count towards leaving it. A round of mistakes (practice)
     * changes only that list.
     */
    public KanaStatsDTO record(User user, KanaResultRequest result) {
        List<Boolean> answers = result == null ? null : result.answers();
        if (answers == null || answers.isEmpty() || answers.size() > MAX_KANA || answers.contains(null)) {
            throw new EntityStateException("A round must have 1 to " + MAX_KANA + " answers");
        }
        List<String> kana = result.kana();
        if (kana == null || kana.size() != answers.size()) {
            throw new EntityStateException("A round must have as many characters as answers");
        }
        List<String> scripts = kana.stream().map(KanaStatsRepository::scriptOf).toList();

        // in a transaction, so two rounds sent at the same time don't overwrite each other
        KanaStats saved = statsDAO.update(user.getId(), () -> new KanaStats(user.getId()), stats -> {
            updateMistakes(stats, kana, answers);
            if (!Boolean.TRUE.equals(result.practice())) {
                countRound(stats, scripts, answers);
            }
        });
        return toDTO(saved);
    }

    /** The characters read wrong and not yet read right twice in a row since, most often wrong first. */
    public List<KanaMistakeDTO> getMistakes(User user) {
        KanaStats stats = statsDAO.get(user.getId());
        return stats == null ? List.of() : toDTOs(stats.getMistakes());
    }

    /** Takes a character off the list of mistakes by hand; a character that isn't on it changes nothing. */
    public List<KanaMistakeDTO> deleteMistake(User user, String kana) {
        KanaStats stats = statsDAO.get(user.getId());
        if (stats == null) {
            return List.of();
        }
        if (MistakeList.remove(stats.getMistakes(), kana)) {
            stats = statsDAO.save(stats);
        }
        return toDTOs(stats.getMistakes());
    }

    /** For deleting an account: its statistics go with it. */
    @Override
    public void deleteDataOf(User user) {
        statsDAO.delete(user.getId());
    }

    /** The script of a character the game asks; anything else is rejected. */
    private static String scriptOf(String kana) {
        if (kana != null && HIRAGANA_KANA.matcher(kana).matches()) {
            return HIRAGANA;
        }
        if (kana != null && KATAKANA_KANA.matcher(kana).matches()) {
            return KATAKANA;
        }
        throw new EntityStateException("Every character must be one hiragana or katakana, maybe with a small ya, yu or yo");
    }

    private static void updateMistakes(KanaStats stats, List<String> kana, List<Boolean> answers) {
        long now = System.currentTimeMillis();
        List<KanaMistake> asked = kana.stream().map(character -> new KanaMistake(character, now)).toList();
        MistakeList.update(stats.getMistakes(), asked, answers, MAX_MISTAKES);
    }

    private static void countRound(KanaStats stats, List<String> scripts, List<Boolean> answers) {
        stats.setRounds(stats.getRounds() + 1);
        if (!answers.contains(false)) {
            stats.setPerfectRounds(stats.getPerfectRounds() + 1);
        }
        for (int i = 0; i < answers.size(); i++) {
            boolean answer = answers.get(i);
            stats.getAskedKana().merge(scripts.get(i), 1, Integer::sum);
            if (answer) {
                stats.getRightKana().merge(scripts.get(i), 1, Integer::sum);
            }
            stats.setCurrentStreak(answer ? stats.getCurrentStreak() + 1 : 0);
            stats.setBestStreak(Math.max(stats.getBestStreak(), stats.getCurrentStreak()));
        }
    }

    private static List<KanaMistakeDTO> toDTOs(List<KanaMistake> mistakes) {
        return MistakeList.sorted(mistakes).stream().map(KanaMistakeDTO::of).toList();
    }

    private static KanaStatsDTO toDTO(KanaStats stats) {
        List<KanaStatsDTO.ScriptStats> scripts = new ArrayList<>();
        int right = 0;
        int asked = 0;
        for (String script : SCRIPTS) {
            int scriptRight = stats.getRightKana().getOrDefault(script, 0);
            int scriptAsked = stats.getAskedKana().getOrDefault(script, 0);
            if (scriptAsked > 0) {
                scripts.add(new KanaStatsDTO.ScriptStats(script, scriptRight, scriptAsked));
            }
            right += scriptRight;
            asked += scriptAsked;
        }
        return new KanaStatsDTO(stats.getRounds(), stats.getPerfectRounds(), right, asked,
                stats.getCurrentStreak(), stats.getBestStreak(), scripts);
    }
}
