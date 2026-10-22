package de.jan.controller.requests;

import java.util.List;

/** The end of a round of "Kana lesen". */
public class KanaResultRequest {

    /** for each character of the round, in order: whether it was read right ("Weiß ich nicht" counts as wrong) */
    private List<Boolean> answers;
    /** the characters of the round, in the same order as the answers, like "し" or "キャ" */
    private List<String> kana;
    /** true for a round of the own mistakes: it changes only the list of mistakes, not the statistics */
    private boolean practice;

    public List<Boolean> getAnswers() { return answers; }
    public void setAnswers(List<Boolean> answers) { this.answers = answers; }

    public List<String> getKana() { return kana; }
    public void setKana(List<String> kana) { this.kana = kana; }

    public boolean isPractice() { return practice; }
    public void setPractice(boolean practice) { this.practice = practice; }
}
