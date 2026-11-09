package de.jan.games.repository;

import de.jan.controller.requests.VocabResultRequest;
import de.jan.exceptions.EntityStateException;
import de.jan.games.*;
import de.jan.user.User;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class VocabStatsRepository extends MistakeStatsRepository<VocabStats, VocabMistake, VocabMistakeDTO> {

    public static final List<String> LEVELS = CrosswordStatsRepository.LEVELS;
    public static final int MAX_WORDS = 20;
    public static final int MAX_MISTAKES = 500;
    public static final int MAX_WORD_LENGTH = 20;
    public static final int MAX_READING_LENGTH = 60;
    public static final int MAX_MEANING_LENGTH = 200;

    /** days until a word in box 1, 2, ... is asked again; a wrong word goes to box 0 and comes again after a day */
    public static final List<Integer> INTERVAL_DAYS = List.of(1, 2, 4, 8, 16, 32, 64);
    public static final int MAX_BOX = INTERVAL_DAYS.size();
    public static final int LEARNED_BOX = 5;

    private final VocabProgressDAO progressDAO = new VocabProgressDAO();

    public VocabStatsRepository() {
        super(new VocabStatsDAO(), MAX_MISTAKES, VocabMistakeDTO::of);
    }

    public VocabStatsDTO get(User user) {
        VocabStats stats = statsDAO.get(user.getId());
        if (stats == null) {
            stats = new VocabStats(user.getId());
        }
        Map<String, VocabProgress> progress = progressDAO.getByIds(LEVELS.stream().map(level -> VocabProgress.idOf(user.getId(), level)).toList())
                .stream().collect(Collectors.toMap(VocabProgress::getId, Function.identity()));
        List<VocabStatsDTO.LevelStats> levels = new ArrayList<>();
        for (String level : LEVELS) {
            VocabProgress levelProgress = progress.get(VocabProgress.idOf(user.getId(), level));
            if (levelProgress != null && !levelProgress.getCards().isEmpty()) {
                List<VocabCard> cards = levelProgress.getCards();
                int learned = (int) cards.stream().filter(card -> card.getBox() >= LEARNED_BOX).count();
                levels.add(new VocabStatsDTO.LevelStats(level, cards.size(), learned));
            }
        }
        return new VocabStatsDTO(stats.getRounds(), stats.getPerfectRounds(), stats.getRightWords(), stats.getAskedWords(),
                stats.getCurrentStreak(), stats.getBestStreak(), levels);
    }

    /** The words had at a level, with their boxes; the frontend picks the due ones and new ones from them. */
    public List<VocabCardDTO> getCards(User user, String level) {
        checkLevel(level);
        VocabProgress progress = progressDAO.get(VocabProgress.idOf(user.getId(), level));
        return progress == null ? List.of() : progress.getCards().stream().map(VocabCardDTO::of).toList();
    }

    /**
     * Counts a round played to the end. Right words go one box up and come again later, wrong ones go back to box 0
     * and on the list of mistakes. A round of mistakes (practice) changes only that list.
     */
    public VocabStatsDTO record(User user, VocabResultRequest result) {
        boolean practice = result != null && Boolean.TRUE.equals(result.practice());
        if (result == null || (!practice && !LEVELS.contains(result.level()))) {
            throw new EntityStateException("Level must be one of " + LEVELS);
        }
        List<Boolean> answers = result.answers();
        if (answers == null || answers.isEmpty() || answers.size() > MAX_WORDS || answers.contains(null)) {
            throw new EntityStateException("A round must have 1 to " + MAX_WORDS + " answers");
        }
        List<VocabResultRequest.Word> words = result.words();
        validate(words, answers.size());

        long now = System.currentTimeMillis();
        List<VocabMistake> asked = words.stream()
                .map(word -> new VocabMistake(word.word(), word.reading(), word.meaning(), now))
                .toList();
        statsDAO.update(user.getId(), () -> new VocabStats(user.getId()), stats -> {
            updateMistakes(stats, asked, answers);
            if (!practice) {
                countRound(stats, answers);
            }
        });
        if (!practice) {
            progressDAO.update(VocabProgress.idOf(user.getId(), result.level()), () -> new VocabProgress(user.getId(), result.level()),
                    progress -> moveCards(progress, words, answers, now));
        }
        return get(user);
    }

    @Override
    public void deleteDataOf(User user) {
        super.deleteDataOf(user);
        LEVELS.forEach(level -> progressDAO.delete(VocabProgress.idOf(user.getId(), level)));
    }

    private static void checkLevel(String level) {
        if (!LEVELS.contains(level)) {
            throw new EntityStateException("Level must be one of " + LEVELS);
        }
    }

    private static void validate(List<VocabResultRequest.Word> words, int answers) {
        if (words == null || words.size() != answers) {
            throw new EntityStateException("A round must have as many words as answers");
        }
        for (VocabResultRequest.Word word : words) {
            if (word == null || word.word() == null || word.word().isBlank()
                    || word.word().length() > MAX_WORD_LENGTH
                    || (word.reading() != null && word.reading().length() > MAX_READING_LENGTH)
                    || (word.meaning() != null && word.meaning().length() > MAX_MEANING_LENGTH)) {
                throw new EntityStateException("Words must have 1 to " + MAX_WORD_LENGTH + " characters, readings at most "
                        + MAX_READING_LENGTH + " and meanings at most " + MAX_MEANING_LENGTH);
            }
        }
    }

    private static void countRound(VocabStats stats, List<Boolean> answers) {
        int right = (int) answers.stream().filter(Boolean::booleanValue).count();
        stats.setRounds(stats.getRounds() + 1);
        stats.setRightWords(stats.getRightWords() + right);
        stats.setAskedWords(stats.getAskedWords() + answers.size());
        if (right == answers.size()) {
            stats.setPerfectRounds(stats.getPerfectRounds() + 1);
        }
        for (boolean answer : answers) {
            stats.setCurrentStreak(answer ? stats.getCurrentStreak() + 1 : 0);
            stats.setBestStreak(Math.max(stats.getBestStreak(), stats.getCurrentStreak()));
        }
    }

    private static void moveCards(VocabProgress progress, List<VocabResultRequest.Word> words, List<Boolean> answers, long now) {
        for (int i = 0; i < words.size(); i++) {
            String word = words.get(i).word();
            VocabCard card = progress.getCards().stream()
                    .filter(existing -> existing.getWord().equals(word))
                    .findFirst()
                    .orElseGet(() -> {
                        VocabCard added = new VocabCard(word);
                        progress.getCards().add(added);
                        return added;
                    });
            int box = answers.get(i) ? Math.min(card.getBox() + 1, MAX_BOX) : 0;
            int days = box == 0 ? 1 : INTERVAL_DAYS.get(box - 1);
            card.setBox(box);
            card.setDueAt(now + Duration.ofDays(days).toMillis());
        }
    }
}
