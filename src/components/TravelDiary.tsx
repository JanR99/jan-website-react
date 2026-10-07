import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, Images } from "lucide-react";
import { useAuth } from "./auth/AuthContext";
import { useTravelFolders } from "../hooks/useTravelFolders";
import { travelFolderPath } from "../utils/travel";
import PageHeader from "./layout/PageHeader";
import TravelFolderCard from "./travel/TravelFolderCard";
import TravelFolderDialog from "./travel/TravelFolderDialog";
import "../styles/Travel.css";

/** The travel diary: all folders, one per trip. Admins can add folders here. */
export default function TravelDiary() {
    const { folders, loading, error } = useTravelFolders();
    const { hasPermission } = useAuth();
    const canManage = hasPermission("MANAGE_TRAVEL");
    const navigate = useNavigate();
    const [creating, setCreating] = useState(false);

    return (
        <div className="container">
            <PageHeader
                eyebrow="Unterwegs"
                title="Reisetagebuch"
                lead="Eindrücke von meinen Reisen – ein Ordner pro Reise."
            >
                {canManage && (
                    <div className="travel-toolbar">
                        <button type="button" className="btn" onClick={() => setCreating(true)}>
                            <FolderPlus size={18} />
                            Neuer Ordner
                        </button>
                    </div>
                )}
            </PageHeader>

            {error && <p className="form-message form-message--error" role="alert">{error}</p>}

            {loading ? (
                <div className="loading"><div className="spinner" /></div>
            ) : folders.length > 0 ? (
                <div className="destination-grid">
                    {folders.map((folder) => <TravelFolderCard key={folder.id} folder={folder} />)}
                </div>
            ) : !error && (
                <div className="card empty-state">
                    <span className="empty-state-icon"><Images size={26} /></span>
                    <h3>Noch keine Reisen</h3>
                    <p>{canManage ? "Lege den ersten Ordner an und lade Fotos hoch." : "Hier erscheinen bald die ersten Fotos."}</p>
                </div>
            )}

            <TravelFolderDialog
                open={creating}
                folder={null}
                onClose={() => setCreating(false)}
                onSaved={(folder) => {
                    setCreating(false);
                    // straight into the new folder, where the photos are added
                    navigate(travelFolderPath(folder));
                }}
            />
        </div>
    );
}
