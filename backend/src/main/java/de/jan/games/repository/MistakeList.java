package de.jan.games.repository;

import de.jan.games.Mistake;

import java.util.Comparator;
import java.util.List;

/** The rules of the lists of mistakes in the reading games, the same for kana and kanji. */
final class MistakeList {

    /** right answers in a row that take an entry off the list */
    static final int RIGHT_TO_LEAVE = 2;

    /** most often wrong first, then the oldest */
    private static final Comparator<Mistake> ORDER =
            Comparator.comparingInt(Mistake::getWrong).reversed().thenComparingLong(Mistake::getAddedAt);

    private MistakeList() {
    }

    /**
     * Wrong answers put an entry on the list or count it once more; right ones count towards leaving it.
     * When the list is longer than maxSize, the oldest entries go.
     *
     * @param asked what the round asked, as new entries would look like, in the order of the answers
     */
    static <M extends Mistake> void update(List<M> mistakes, List<M> asked, List<Boolean> answers, int maxSize) {
        for (int i = 0; i < asked.size(); i++) {
            M entry = asked.get(i);
            M mistake = mistakes.stream()
                    .filter(existing -> existing.getKey().equals(entry.getKey()))
                    .findFirst()
                    .orElse(null);
            if (!answers.get(i)) {
                if (mistake == null) {
                    mistake = entry;
                    mistakes.add(mistake);
                } else {
                    mistake.refresh(entry);
                }
                mistake.setWrong(mistake.getWrong() + 1);
                mistake.setRightInRow(0);
            } else if (mistake != null) {
                mistake.setRightInRow(mistake.getRightInRow() + 1);
                if (mistake.getRightInRow() >= RIGHT_TO_LEAVE) {
                    mistakes.remove(mistake);
                }
            }
        }
        while (mistakes.size() > maxSize) {
            mistakes.remove(mistakes.stream().min(Comparator.comparingLong(Mistake::getAddedAt)).orElseThrow());
        }
    }

    /** Takes an entry off the list by hand; returns whether there was one. */
    static boolean remove(List<? extends Mistake> mistakes, String key) {
        return mistakes.removeIf(mistake -> mistake.getKey().equals(key));
    }

    /** The entries in the order they are shown. */
    static <M extends Mistake> List<M> sorted(List<M> mistakes) {
        return mistakes.stream().sorted(ORDER).toList();
    }
}
