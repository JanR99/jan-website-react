package de.jan.mail;

import de.jan.user.User;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/** A mail to a user with a link into the frontend that carries a one-time token. */
public abstract class LinkMailService extends AbstractMailService<LinkMailService.LinkMail> {

    public record LinkMail(User user, String token, long valid) { }

    private final String frontendUrl;

    protected LinkMailService(BrevoMailSender mailSender, MailTemplates templates, String frontendUrl) {
        super(mailSender, templates);
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    /** The page of the frontend the link opens, up to the token. */
    protected abstract String getPath();

    @Override
    protected String getRecipient(LinkMail mail) {
        return mail.user().getEmail();
    }

    @Override
    protected Map<String, Object> getVariables(LinkMail mail) {
        return Map.of(
                "firstname", clean(mail.user().getFirstname()),
                "link", frontendUrl + getPath() + URLEncoder.encode(mail.token(), StandardCharsets.UTF_8),
                "valid", mail.valid());
    }
}
