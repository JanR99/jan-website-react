package de.jan.games.repository;

import de.jan.controller.requests.KanjiResultRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.games.KanjiMistake;
import de.jan.games.KanjiMistakeDTO;
import de.jan.games.KanjiStats;
import de.jan.games.KanjiStatsDAO;
import de.jan.games.KanjiStatsDTO;
import de.jan.user.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class KanjiStatsRepository {

    public static final List<String> LEVELS = CrosswordStatsRepository.LEVELS;
    /** more words than a round ever has */
    public static final int MAX_WORDS = 20;
    /** right answers in a row that take a word off the list of mistakes */
    public static final int RIGHT_TO_LEAVE = 2;
    /** the list of mistakes keeps at most this many words, dropping the oldest */
    public static final int MAX_MISTAKES = 500;
    public static final int MAX_WORD_LENGTH = 20;
    public static final int MAX_READING_LENGTH = 60;
    public static final int MAX_MEANING_LENGTH = 200;

    /** most often wrong first, then the oldest */
    private static final Comparator<KanjiMistake> MISTAKE_ORDER =
            Comparator.comparingInt(KanjiMistake::getWrong).reversed().thenComparingLong(KanjiMistake::getAddedAt);

    private final KanjiStatsDAO statsDAO = new KanjiStatsDAO();

    public KanjiStatsDTO get(User user) {
        KanjiStats stats = statsDAO.getById(user.getId());
        return toDTO(stats != null ? stats : new KanjiStats(user.getId()));
    }

    /**
     * Counts a round played to the end: its words, the right ones, a perfect round if all were right,
     * and the streak of right words, which goes on from round to round until a wrong one.
     * With the words given, wrong ones go on the list of mistakes and right ones count towards leaving it.
     * A round of mistakes (practice) changes only that list.
     */
    public KanjiStatsDTO record(User user, KanjiResultRequest result) {
        if (result == null || (!result.isPractice() && !LEVELS.contains(result.getLevel()))) {
            throw new EntityStateException("Level must be one of " + LEVELS);
        }
        List<Boolean> answers = result.getAnswers();
        if (answers == null || answers.isEmpty() || answers.size() > MAX_WORDS || answers.contains(null)) {
            throw new EntityStateException("A round must have 1 to " + MAX_WORDS + " answers");
        }
        List<KanjiResultRequest.Word> words = result.getWords();
        if (words != null) {
            validate(words, answers.size());
        }

        KanjiStats stats = statsDAO.getById(user.getId());
        if (stats == null) {
            stats = new KanjiStats(user.getId());
        }
        if (words != null) {
            updateMistakes(stats, words, answers);
        }
        if (!result.isPractice()) {
            countRound(stats, result.getLevel(), answers);
        }
        return toDTO(statsDAO.save(stats));
    }

    /** The words read wrong and not yet read right twice in a row since, most often wrong first. */
    public List<KanjiMistakeDTO> getMistakes(User user) {
        KanjiStats stats = statsDAO.getById(user.getId());
        return stats == null ? List.of() : toDTOs(stats.getMistakes());
    }

    /** Takes a word off the list of mistakes by hand; a word that isn't on it changes nothing. */
    public List<KanjiMistakeDTO> deleteMistake(User user, String word) {
        KanjiStats stats = statsDAO.getById(user.getId());
        if (stats == null) {
            return List.of();
        }
        if (stats.getMistakes().removeIf(mistake -> mistake.getWord().equals(word))) {
            stats = statsDAO.save(stats);
        }
        return toDTOs(stats.getMistakes());
    }

    private static void validate(List<KanjiResultRequest.Word> words, int answers) {
        if (words.size() != answers) {
            throw new EntityStateException("A round must have as many words as answers");
        }
        for (KanjiResultRequest.Word word : words) {
            if (word == null || word.getWord() == null || word.getWord().isBlank()
                    || word.getWord().length() > MAX_WORD_LENGTH
                    || (word.getReading() != null && word.getReading().length() > MAX_READING_LENGTH)
                    || (word.getMeaning() != null && word.getMeaning().length() > MAX_MEANING_LENGTH)) {
                throw new EntityStateException("Words must have 1 to " + MAX_WORD_LENGTH + " characters, readings at most "
                        + MAX_READING_LENGTH + " and meanings at most " + MAX_MEANING_LENGTH);
            }
        }
    }

    private static void updateMistakes(KanjiStats stats, List<KanjiResultRequest.Word> words, List<Boolean> answers) {
        List<KanjiMistake> mistakes = stats.getMistakes();
        long now = System.currentTimeMillis();
        for (int i = 0; i < words.size(); i++) {
            KanjiResultRequest.Word word = words.get(i);
            KanjiMistake mistake = mistakes.stream()
                    .filter(entry -> entry.getWord().equals(word.getWord()))
                    .findFirst()
                    .orElse(null);
            if (!answers.get(i)) {
                if (mistake == null) {
                    mistake = new KanjiMistake(word.getWord(), word.getReading(), word.getMeaning(), now);
                    mistakes.add(mistake);
                }
                mistake.setReading(word.getReading());
                mistake.setMeaning(word.getMeaning());
                mistake.setWrong(mistake.getWrong() + 1);
                mistake.setRightInRow(0);
            } else if (mistake != null) {
                mistake.setRightInRow(mistake.getRightInRow() + 1);
                if (mistake.getRightInRow() >= RIGHT_TO_LEAVE) {
                    mistakes.remove(mistake);
                }
            }
        }
        while (mistakes.size() > MAX_MISTAKES) {
            mistakes.remove(mistakes.stream().min(Comparator.comparingLong(KanjiMistake::getAddedAt)).orElseThrow());
        }
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
        return mistakes.stream().sorted(MISTAKE_ORDER).map(KanjiMistakeDTO::of).toList();
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
