package de.jan.mail;

/** A mail in templates/mail, as fileName.html and fileName.txt. */
public enum MailTemplate {

    CONFIRMATION("confirmation"),
    PASSWORD_RESET("password-reset"),
    FEEDBACK("feedback"),
    REGISTRATION("registration"),
    SERVER_ERROR("server-error");

    private final String fileName;

    MailTemplate(String fileName) {
        this.fileName = fileName;
    }

    public String fileName() { return fileName; }
}
