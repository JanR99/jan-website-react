package de.jan.controller.requests;

import java.util.List;

/** The end of a round of "Kanji lesen". */
public class KanjiResultRequest {

    /** A word of the round, as the game showed it; goes on the list of mistakes when it was read wrong. */
    public static class Word {
        /** the word in kanji, like "本" */
        private String word;
        private String reading;
        private String meaning;

        public String getWord() { return word; }
        public void setWord(String word) { this.word = word; }

        public String getReading() { return reading; }
        public void setReading(String reading) { this.reading = reading; }

        public String getMeaning() { return meaning; }
        public void setMeaning(String meaning) { this.meaning = meaning; }
    }

    /** the level it was played at, "A1" to "C2"; not needed for a round of mistakes */
    private String level;
    /** for each word of the round, in order: whether it was read right ("Weiß ich nicht" counts as wrong) */
    private List<Boolean> answers;
    /** the words of the round, in the same order as the answers */
    private List<Word> words;
    /** true for a round of the own mistakes: it changes only the list of mistakes, not the statistics */
    private boolean practice;

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public List<Boolean> getAnswers() { return answers; }
    public void setAnswers(List<Boolean> answers) { this.answers = answers; }

    public List<Word> getWords() { return words; }
    public void setWords(List<Word> words) { this.words = words; }

    public boolean isPractice() { return practice; }
    public void setPractice(boolean practice) { this.practice = practice; }
}
