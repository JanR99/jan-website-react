package de.jan.mail;

public enum Sender {

    NO_REPLY("noreply", "Jans Website");

    private final String localPart;
    private final String displayName;

    Sender(String localPart, String displayName) {
        this.localPart = localPart;
        this.displayName = displayName;
    }

    public String localPart() { return localPart; }
    public String displayName() { return displayName; }
}
