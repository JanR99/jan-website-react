import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../layout/PageHeader";
import UserController from "../../controller/UserController.ts";
import { useAuth } from "./AuthContext.tsx";
import FormError from "../ui/FormError";
import Spinner from "../ui/Spinner";

const confirmations = new Map<string, Promise<void>>();

function confirmOnce(token: string): Promise<void> {
    let confirmation = confirmations.get(token);
    if (!confirmation) {
        confirmation = UserController.confirmEmail({ token });
        confirmations.set(token, confirmation);
    }
    return confirmation;
}

export default function EmailConfirmPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const { openAuthDialog } = useAuth();
    const [result, setResult] = useState<{ token: string; failed: boolean } | null>(null);

    useEffect(() => {
        if (!token) return;
        let active = true;
        confirmOnce(token).then(
            () => active && setResult({ token, failed: false }),
            () => active && setResult({ token, failed: true }),
        );
        return () => {
            active = false;
        };
    }, [token]);

    const done = result?.token === token ? result : null;

    return (
        <div className="container password-reset">
            <PageHeader title="E-Mail-Adresse bestätigen" back={{ to: "/", label: "Zur Startseite" }} />

            <div className="card card-pad password-reset-card">
                {!token ? (
                    <FormError message="Dieser Link ist unvollständig. Öffne bitte den Link aus der Mail noch einmal." />
                ) : !done ? (
                    <Spinner />
                ) : done.failed ? (
                    <div className="auth-form">
                        <FormError message="Dieser Link ist ungültig oder abgelaufen. Melde dich mit deinem Passwort an, dann kannst du dir eine neue Mail schicken lassen." />
                        <button type="button" className="btn btn-block" onClick={() => openAuthDialog("login")}>
                            Anmelden
                        </button>
                    </div>
                ) : (
                    <div className="auth-form">
                        <p className="form-message form-message--success" role="status">
                            Deine E-Mail-Adresse ist bestätigt. Du kannst dich jetzt anmelden.
                        </p>
                        <button type="button" className="btn btn-block" onClick={() => openAuthDialog("login")}>
                            Jetzt anmelden
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
