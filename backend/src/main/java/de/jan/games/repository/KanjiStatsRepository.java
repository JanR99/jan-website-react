package de.jan.games.repository;

import de.jan.controller.requests.KanjiResultRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.games.*;
import de.jan.user.User;
import de.jan.user.UserDataOwner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class KanjiStatsRepository implements UserDataOwner {

    public static final List<String> LEVELS = CrosswordStatsRepository.LEVELS;
    /** more words than a round ever has */
    public static final int MAX_WORDS = 20;
    /** the list of mistakes keeps at most this many words, dropping the oldest */
    public static final int MAX_MISTAKES = 500;
    public static final int MAX_WORD_LENGTH = 20;
    public static final int MAX_READING_LENGTH = 60;
    public static final int MAX_MEANING_LENGTH = 200;

    private final KanjiStatsDAO statsDAO = new KanjiStatsDAO();

    public KanjiStatsDTO get(User user) {
        KanjiStats stats = statsDAO.get(user.getId());
        return toDTO(stats != null ? stats : new KanjiStats(user.getId()));
    }

    /**
     * Counts a round played to the end: its words, the right ones, a perfect round if all were right,
     * and the streak of right words, which goes on from round to round until a wrong one.
     * With the words given, wrong ones go on the list of mistakes and right ones count towards leaving it.
     * A round of mistakes (practice) changes only that list.
     */
    public KanjiStatsDTO record(User user, KanjiResultRequest result) {
        if (result == null || (!Boolean.TRUE.equals(result.practice()) && !LEVELS.contains(result.level()))) {
            throw new EntityStateException("Level must be one of " + LEVELS);
        }
        List<Boolean> answers = result.answers();
        if (answers == null || answers.isEmpty() || answers.size() > MAX_WORDS || answers.contains(null)) {
            throw new EntityStateException("A round must have 1 to " + MAX_WORDS + " answers");
        }
        List<KanjiResultRequest.Word> words = result.words();
        if (words != null) {
            validate(words, answers.size());
        }

        // in a transaction, so two rounds sent at the same time don't overwrite each other
        KanjiStats saved = statsDAO.update(user.getId(), () -> new KanjiStats(user.getId()), stats -> {
            if (words != null) {
                updateMistakes(stats, words, answers);
            }
            if (!Boolean.TRUE.equals(result.practice())) {
                countRound(stats, result.level(), answers);
            }
        });
        return toDTO(saved);
    }

    /** The words read wrong and not yet read right twice in a row since, most often wrong first. */
    public List<KanjiMistakeDTO> getMistakes(User user) {
        KanjiStats stats = statsDAO.get(user.getId());
        return stats == null ? List.of() : toDTOs(stats.getMistakes());
    }

    /** Takes a word off the list of mistakes by hand; a word that isn't on it changes nothing. */
    public List<KanjiMistakeDTO> deleteMistake(User user, String word) {
        KanjiStats stats = statsDAO.get(user.getId());
        if (stats == null) {
            return List.of();
        }
        if (MistakeList.remove(stats.getMistakes(), word)) {
            stats = statsDAO.save(stats);
        }
        return toDTOs(stats.getMistakes());
    }

    private static void validate(List<KanjiResultRequest.Word> words, int answers) {
        if (words.size() != answers) {
            throw new EntityStateException("A round must have as many words as answers");
        }
        for (KanjiResultRequest.Word word : words) {
            if (word == null || word.word() == null || word.word().isBlank()
                    || word.word().length() > MAX_WORD_LENGTH
                    || (word.reading() != null && word.reading().length() > MAX_READING_LENGTH)
                    || (word.meaning() != null && word.meaning().length() > MAX_MEANING_LENGTH)) {
                throw new EntityStateException("Words must have 1 to " + MAX_WORD_LENGTH + " characters, readings at most "
                        + MAX_READING_LENGTH + " and meanings at most " + MAX_MEANING_LENGTH);
            }
        }
    }

    private static void updateMistakes(KanjiStats stats, List<KanjiResultRequest.Word> words, List<Boolean> answers) {
        long now = System.currentTimeMillis();
        List<KanjiMistake> asked = words.stream()
                .map(word -> new KanjiMistake(word.word(), word.reading(), word.meaning(), now))
                .toList();
        MistakeList.update(stats.getMistakes(), asked, answers, MAX_MISTAKES);
    }

    private static void countRound(KanjiStats stats, String level, List<Boolean> answers) {
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
    }

    private static List<KanjiMistakeDTO> toDTOs(List<KanjiMistake> mistakes) {
        return MistakeList.sorted(mistakes).stream().map(KanjiMistakeDTO::of).toList();
    }

    /** For deleting an account: its statistics go with it. */
    @Override
    public void deleteDataOf(User user) {
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
