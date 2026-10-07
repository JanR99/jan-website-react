import { lazy, Suspense, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus, Images } from "lucide-react";
import { useAuth } from "./auth/AuthContext";
import { useOnline } from "../hooks/useOnline";
import { useTravelFolders } from "../hooks/useTravelFolders";
import { folderPosition, travelFolderPath } from "../utils/travel";
import PageHeader from "./layout/PageHeader";
import TravelFolderCard from "./travel/TravelFolderCard";
import TravelFolderDialog from "./travel/TravelFolderDialog";
import "../styles/Travel.css";

const TravelMap = lazy(() => import("./travel/TravelMap"));

/** The travel diary: a map and all folders, one per trip. Admins can add folders here. */
export default function TravelDiary() {
    const { folders, loading, error } = useTravelFolders();
    const { hasPermission } = useAuth();
    const canManage = hasPermission("MANAGE_TRAVEL");
    const navigate = useNavigate();
    const [creating, setCreating] = useState(false);
    // the map tiles come from OpenStreetMap and are not stored for offline use, so no map without network
    const online = useOnline();
    const onMap = useMemo(() => folders.filter((folder) => folderPosition(folder) !== null), [folders]);

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
                {canManage && folders.length > 0 && onMap.length === 0 && (
                    <p className="muted travel-map-missing">
                        Die Karte erscheint, sobald ein Ordner einen Ort hat – im Ordner unter „Ordner bearbeiten“.
                    </p>
                )}
            </PageHeader>

            {error && <p className="form-message form-message--error" role="alert">{error}</p>}

            {online && onMap.length > 0 && (
                <Suspense fallback={<div className="travel-map" aria-hidden="true" />}>
                    <TravelMap folders={onMap} />
                </Suspense>
            )}

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
