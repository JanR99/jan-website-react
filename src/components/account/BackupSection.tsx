import { useState } from "react";
import { Download, Lock } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import BackupController from "../../controller/BackupController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { PERMISSIONS } from "../../types/roles";
import { backupFileName, fileSizeLabel } from "../../utils/backup";

/** Hands a loaded file to the browser, which saves it like any other download. */
function saveFile(file: Blob, name: string) {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // not right away: the browser may not have started the download yet
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Lets an admin download the recipes and the travel diary with all images as one ZIP file. */
export default function BackupSection() {
    const { permissions, hasPermission } = useAuth();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    /** name and size of the file that was downloaded last */
    const [saved, setSaved] = useState<string | null>(null);

    async function download() {
        setBusy(true);
        setError(null);
        setSaved(null);
        try {
            const file = await BackupController.exportBackup();
            const name = backupFileName(new Date());
            saveFile(file, name);
            setSaved(`${name} (${fileSizeLabel(file.size)})`);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setBusy(false);
        }
    }

    if (permissions === null) {
        return <div className="loading"><div className="spinner" /></div>;
    }

    if (!hasPermission("EXPORT_DATA")) {
        return (
            <div className="card empty-state">
                <span className="empty-state-icon"><Lock size={26} /></span>
                <h3>Keine Berechtigung</h3>
                <p>Für diesen Bereich brauchst du das Recht „{PERMISSIONS.EXPORT_DATA}“.</p>
            </div>
        );
    }

    return (
        <div className="account-stack">
            <div className="card card-pad">
                <div className="account-card-head">
                    <h2 className="account-card-title">Rezepte und Reisen</h2>
                    <button type="button" className="btn btn-sm" onClick={download} disabled={busy}>
                        <Download size={16} />
                        {busy ? "Wird erstellt …" : "Herunterladen"}
                    </button>
                </div>
                <p className="muted">
                    Eine ZIP-Datei mit allen Rezepten und Reisen samt Rezeptbildern und Reisefotos.
                    Nutzerkonten und Favoriten sind nicht enthalten.
                </p>
                {busy && (
                    <p className="muted" role="status">
                        Das Backup wird zusammengestellt. Mit allen Fotos kann das einen Moment dauern.
                    </p>
                )}
                {error && <p className="form-message form-message--error" role="alert">{error}</p>}
                {saved && (
                    <p className="form-message form-message--success profile-saved" role="status">
                        Heruntergeladen: {saved}
                    </p>
                )}
            </div>
        </div>
    );
}
