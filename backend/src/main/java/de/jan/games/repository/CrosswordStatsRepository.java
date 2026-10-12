package de.jan.games.repository;

import de.jan.controller.requests.CrosswordResultRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.games.CrosswordStats;
import de.jan.games.CrosswordStatsDAO;
import de.jan.games.CrosswordStatsDTO;
import de.jan.user.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CrosswordStatsRepository {

    public static final List<String> SCRIPTS = List.of("hiragana", "katakana");
    public static final List<String> LEVELS = List.of("A1", "A2", "B1", "B2", "C1", "C2");
    /** more words than a crossword ever has */
    public static final int MAX_WORDS = 50;

    private final CrosswordStatsDAO statsDAO = new CrosswordStatsDAO();

    public CrosswordStatsDTO get(User user) {
        CrosswordStats stats = statsDAO.getById(user.getId());
        return toDTO(stats != null ? stats : new CrosswordStats(user.getId()));
    }

    /**
     * Counts a finished crossword: one solved without help adds to the solved crosswords and the streak,
     * one finished with help ends the streak. The words got right count either way.
     */
    public CrosswordStatsDTO record(User user, CrosswordResultRequest result) {
        if (result == null || !SCRIPTS.contains(result.getScript())) {
            throw new EntityStateException("Script must be one of " + SCRIPTS);
        }
        if (!LEVELS.contains(result.getLevel())) {
            throw new EntityStateException("Level must be one of " + LEVELS);
        }
        if (result.getRightWords() < 0 || result.getRightWords() > MAX_WORDS) {
            throw new EntityStateException("Right words must be between 0 and " + MAX_WORDS);
        }

        CrosswordStats stats = statsDAO.getById(user.getId());
        if (stats == null) {
            stats = new CrosswordStats(user.getId());
        }
        String key = key(result.getScript(), result.getLevel());
        stats.getWords().merge(key, result.getRightWords(), Integer::sum);
        if (result.isSolved()) {
            stats.getSolved().merge(key, 1, Integer::sum);
            stats.setCurrentStreak(stats.getCurrentStreak() + 1);
            stats.setBestStreak(Math.max(stats.getBestStreak(), stats.getCurrentStreak()));
        } else {
            stats.setCurrentStreak(0);
        }
        return toDTO(statsDAO.save(stats));
    }

    /** For deleting an account: its statistics go with it. */
    public void delete(User user) {
        statsDAO.delete(user.getId());
    }

    private static String key(String script, String level) {
        return script + "-" + level;
    }

    private static CrosswordStatsDTO toDTO(CrosswordStats stats) {
        List<CrosswordStatsDTO.LevelStats> levels = new ArrayList<>();
        int solved = 0;
        int words = 0;
        for (String script : SCRIPTS) {
            for (String level : LEVELS) {
                String key = key(script, level);
                int levelSolved = stats.getSolved().getOrDefault(key, 0);
                int levelWords = stats.getWords().getOrDefault(key, 0);
                if (levelSolved > 0 || levelWords > 0) {
                    levels.add(new CrosswordStatsDTO.LevelStats(script, level, levelSolved, levelWords));
                }
                solved += levelSolved;
                words += levelWords;
            }
        }
        return new CrosswordStatsDTO(solved, words, stats.getCurrentStreak(), stats.getBestStreak(), levels);
    }
}
