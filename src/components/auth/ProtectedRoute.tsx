import type { ReactNode } from "react";
import { useAuth } from "./AuthContext.tsx";
import { User } from "lucide-react";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, openAuthDialog } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="container">
                <div className="card empty-state" style={{ marginTop: 48 }}>
                    <span className="empty-state-icon">
                        <User size={26} />
                    </span>
                    <h3>Bitte melde dich an</h3>
                    <p>Dieser Bereich ist nur für angemeldete Nutzer sichtbar.</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
                        <button type="button" className="btn" onClick={() => openAuthDialog("login")}>
                            Anmelden
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => openAuthDialog("register")}>
                            Konto erstellen
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return <>{children}</>;
}
