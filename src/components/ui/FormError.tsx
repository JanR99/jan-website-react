/** An error message under a form or a list; nothing while there is none. */
export default function FormError({ message }: { message: string | null | undefined }) {
    if (!message) return null;
    return <p className="form-message form-message--error" role="alert">{message}</p>;
}
