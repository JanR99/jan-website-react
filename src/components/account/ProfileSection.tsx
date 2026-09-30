import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import { BookOpen, Heart } from "lucide-react";

export default function ProfileSection() {
    const { user } = useAuth();
    const { favorites } = useFavorites();
    if (!user) return null;

    const rows: [string, string][] = [
        ["Vorname", user.firstname],
        ["Nachname", user.lastname],
        ["E-Mail", user.email],
    ];

    return (
        <div className="account-stack">
            <div className="card card-pad">
                <h2 className="account-card-title">Persönliche Daten</h2>
                <dl className="profile-list">
                    {rows.map(([label, value]) => (
                        <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value || "–"}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            <div className="account-tiles">
                <Link to="/konto/favoriten" className="account-tile card">
                    <span className="account-tile-icon"><Heart size={20} /></span>
                    <strong>{favorites.length}</strong>
                    <span className="muted">Lieblingsrezepte</span>
                </Link>
                <Link to="/cookbook" className="account-tile card">
                    <span className="account-tile-icon"><BookOpen size={20} /></span>
                    <strong>Kochbuch</strong>
                    <span className="muted">Neue Rezepte entdecken</span>
                </Link>
            </div>
        </div>
    );
}
