package de.jan.games.repository;

import de.jan.controller.requests.KanjiResultRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.games.KanjiStats;
import de.jan.games.KanjiStatsDAO;
import de.jan.games.KanjiStatsDTO;
import de.jan.user.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class KanjiStatsRepository {

    public static final List<String> LEVELS = CrosswordStatsRepository.LEVELS;
    /** more words than a round ever has */
    public static final int MAX_WORDS = 20;

    private final KanjiStatsDAO statsDAO = new KanjiStatsDAO();

    public KanjiStatsDTO get(User user) {
        KanjiStats stats = statsDAO.getById(user.getId());
        return toDTO(stats != null ? stats : new KanjiStats(user.getId()));
    }

    /**
     * Counts a round played to the end: its words, the right ones, a perfect round if all were right,
     * and the streak of right words, which goes on from round to round until a wrong one.
     */
    public KanjiStatsDTO record(User user, KanjiResultRequest result) {
        if (result == null || !LEVELS.contains(result.getLevel())) {
            throw new EntityStateException("Level must be one of " + LEVELS);
        }
        List<Boolean> answers = result.getAnswers();
        if (answers == null || answers.isEmpty() || answers.size() > MAX_WORDS || answers.contains(null)) {
            throw new EntityStateException("A round must have 1 to " + MAX_WORDS + " answers");
        }

        KanjiStats stats = statsDAO.getById(user.getId());
        if (stats == null) {
            stats = new KanjiStats(user.getId());
        }
        String level = result.getLevel();
        int right = (int) answers.stream().filter(Boolean::booleanValue).count();
        stats.getRounds().merge(level, 1, Integer::sum);
        stats.getRightWords().merge(level, right, Integer::sum);
        stats.getAskedWords().merge(level, answers.size(), Integer::sum);
        if (right == answers.size()) {
            stats.getPerfectRounds().merge(level, 1, Integer::sum);
        }
        for (boolean answer : answers) {
            stats.setCurrentStreak(answer ? stats.getCurrentStreak() + 1 : 0);
            stats.setBestStreak(Math.max(stats.getBestStreak(), stats.getCurrentStreak()));
        }
        return toDTO(statsDAO.save(stats));
    }

    /** For deleting an account: its statistics go with it. */
    public void delete(User user) {
        statsDAO.delete(user.getId());
    }

    private static KanjiStatsDTO toDTO(KanjiStats stats) {
        List<KanjiStatsDTO.LevelStats> levels = new ArrayList<>();
        int rounds = 0;
        int perfectRounds = 0;
        int rightWords = 0;
        int askedWords = 0;
        for (String level : LEVELS) {
            int levelRounds = stats.getRounds().getOrDefault(level, 0);
            int levelPerfect = stats.getPerfectRounds().getOrDefault(level, 0);
            int levelRight = stats.getRightWords().getOrDefault(level, 0);
            int levelAsked = stats.getAskedWords().getOrDefault(level, 0);
            if (levelRounds > 0) {
                levels.add(new KanjiStatsDTO.LevelStats(level, levelRounds, levelPerfect, levelRight, levelAsked));
            }
            rounds += levelRounds;
            perfectRounds += levelPerfect;
            rightWords += levelRight;
            askedWords += levelAsked;
        }
        return new KanjiStatsDTO(rounds, perfectRounds, rightWords, askedWords,
                stats.getCurrentStreak(), stats.getBestStreak(), levels);
    }
}
