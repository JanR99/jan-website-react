import { useRef, useState } from "react";
import { Download, Lock, Upload } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import PermissionsPending from "./PermissionsPending";
import BackupController from "../../controller/BackupController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { reloadRecipes } from "../../hooks/useRecipes";
import { reloadTravelFolders } from "../../hooks/useTravelFolders";
import { RestoreResult } from "../../types/backup";
import { PERMISSIONS } from "../../types/roles";
import { backupFileName, fileSizeLabel, restoreProblems, restoreSummary } from "../../utils/backup";
import Dialog from "../ui/Dialog";

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

/**
 * Lets an admin download the recipes and the travel diary with all images as one ZIP file,
 * and on a local machine put such a file back into the database.
 */
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
        return <PermissionsPending />;
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
            {/* the backend only restores on a local machine, so the website doesn't offer it */}
            {import.meta.env.DEV && <RestoreCard />}
        </div>
    );
}

/** Replaces the recipes and trips of the local database by the ones of a backup file, after asking. */
function RestoreCard() {
    const inputRef = useRef<HTMLInputElement>(null);
    /** the chosen file, while the dialog asks whether to restore it */
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<RestoreResult | null>(null);

    function close() {
        if (busy) return;
        setFile(null);
        setError(null);
    }

    async function restore() {
        if (!file) return;
        setBusy(true);
        setError(null);
        try {
            setResult(await BackupController.restoreBackup(file));
            setFile(null);
            // everything the pages have loaded is from before
            void reloadRecipes();
            void reloadTravelFolders();
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="card card-pad">
            <div className="account-card-head">
                <h2 className="account-card-title">Backup einspielen</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>
                    <Upload size={16} />
                    Datei auswählen
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".zip,application/zip"
                    hidden
                    onChange={(e) => {
                        const chosen = e.target.files?.[0];
                        e.target.value = "";
                        if (chosen) {
                            setResult(null);
                            setFile(chosen);
                        }
                    }}
                />
            </div>
            <p className="muted">
                Ersetzt alle Rezepte und Reisen dieser lokalen Datenbank durch die aus einer Backup-Datei,
                zum Beispiel um den Stand der Website lokal zu testen. Das gibt es nur lokal, nicht auf der Website.
            </p>
            {result && (
                <p className="form-message form-message--success profile-saved" role="status">
                    {restoreSummary(result)}
                </p>
            )}
            {result && restoreProblems(result).map((problem) => (
                <p key={problem} className="form-message form-message--error" role="alert">{problem}</p>
            ))}

            <Dialog open={file !== null} onClose={close} labelledBy="restore-backup-title" className="confirm-dialog">
                <h2 id="restore-backup-title">Backup einspielen?</h2>
                <p className="muted">
                    Alle Rezepte und Reisen der lokalen Datenbank werden gelöscht und durch die
                    aus „{file?.name}“ ({fileSizeLabel(file?.size ?? 0)}) ersetzt. Favoriten gehen dabei verloren.
                </p>
                {busy && (
                    <p className="muted" role="status">
                        Das Backup wird eingespielt. Mit allen Fotos kann das einen Moment dauern.
                    </p>
                )}
                {error && <p className="form-message form-message--error" role="alert">{error}</p>}
                <div className="profile-form-actions">
                    <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>
                        Abbrechen
                    </button>
                    <button type="button" className="btn btn-danger" onClick={restore} disabled={busy}>
                        {busy ? "Wird eingespielt …" : "Einspielen"}
                    </button>
                </div>
            </Dialog>
        </div>
    );
}
