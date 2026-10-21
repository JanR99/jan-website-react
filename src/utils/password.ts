export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;

/** Why a new password can't be used, or null when it can. */
export function passwordProblem(password: string): string | null {
    if (password.length < PASSWORD_MIN_LENGTH) {
        return `Das Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein.`;
    }
    if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
        return `Das Passwort ist zu lang: höchstens ${PASSWORD_MAX_BYTES} Zeichen, Umlaute und Emojis zählen mehrfach.`;
    }
    return null;
}
