package de.jan.controller.requests;

import java.util.List;

/** The end of a round of "Kanji lesen". */
public class KanjiResultRequest {

    /** the level it was played at, "A1" to "C2" */
    private String level;
    /** for each word of the round, in order: whether it was read right ("Weiß ich nicht" counts as wrong) */
    private List<Boolean> answers;

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public List<Boolean> getAnswers() { return answers; }
    public void setAnswers(List<Boolean> answers) { this.answers = answers; }
}
