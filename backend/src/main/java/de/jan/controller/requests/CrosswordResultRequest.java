package de.jan.controller.requests;

/** The end of a crossword: solved without help, or finished with "Feld aufdecken" or "Lösung zeigen". */
public class CrosswordResultRequest {

    /** "hiragana" or "katakana" */
    private String script;
    /** the level it was played at, "A1" to "C2" */
    private String level;
    /** true if it was solved without help, false if squares or the solution were shown */
    private boolean solved;
    /** words the user got right without having them shown */
    private int rightWords;

    public String getScript() { return script; }
    public void setScript(String script) { this.script = script; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public boolean isSolved() { return solved; }
    public void setSolved(boolean solved) { this.solved = solved; }

    public int getRightWords() { return rightWords; }
    public void setRightWords(int rightWords) { this.rightWords = rightWords; }
}
