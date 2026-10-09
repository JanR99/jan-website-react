import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowDownUp, Images, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "./auth/AuthContext";
import TravelController from "../controller/TravelController";
import { handleApiError } from "../controller/util/ErrorHandler";
import { usePageTitle } from "../hooks/usePageTitle";
import { useRecipes } from "../hooks/useRecipes";
import { dropTravelFolder, dropTravelPhoto, reloadTravelFolders, useTravelFolders } from "../hooks/useTravelFolders";
import LoadError from "./ui/LoadError";
import { TravelFolder } from "../types/Travel";
import { folderRecipes, folderSubtitle, photoCountLabel, photoDescription, TRAVEL_BASE } from "../utils/travel";
import PageHeader from "./layout/PageHeader";
import RecipeCard from "./RecipeCard";
import TravelFolderDialog from "./travel/TravelFolderDialog";
import TravelFolderLink from "./travel/TravelFolderLink";
import TravelFolderText from "./travel/TravelFolderText";
import TravelLightbox from "./travel/TravelLightbox";
import TravelPhotoDropzone from "./travel/TravelPhotoDropzone";
import TravelPhotoSorter from "./travel/TravelPhotoSorter";
import Dialog from "./ui/Dialog";
import "../styles/Cookbook.css";
import "../styles/Destination.css";
import "../styles/Travel.css";

/** What an admin is about to delete, shown in the confirm dialog. */
type DeleteTarget = { kind: "photo"; photoId: number; number: number } | { kind: "folder" };

/**
 * One trip of the travel diary: its text, its photos as a gallery and the recipes of its cuisine.
 * Admins can write the text and add and remove photos here.
 */
export default function TravelFolderPage() {
    const { folderId } = useParams();
    const { folders, loading, error } = useTravelFolders();
    const { recipes } = useRecipes();
    const { hasPermission } = useAuth();
    const canManage = hasPermission("MANAGE_TRAVEL");
    const navigate = useNavigate();

    const folder = folders.find((f) => String(f.id) === folderId);
    const count = folder?.photos.length ?? 0;
    usePageTitle(folder?.name);

    const [lightbox, setLightbox] = useState<number | null>(null);
    const [editing, setEditing] = useState(false);
    /** the folder whose photos an admin is sorting; kept by id, so opening another trip ends it */
    const [sortingId, setSortingId] = useState<number | null>(null);
    const [toDelete, setToDelete] = useState<DeleteTarget | null>(null);

    if (!folder) {
        if (loading) {
            return <div className="container"><div className="loading"><div className="spinner" /></div></div>;
        }
        if (error) {
            return (
                <div className="container">
                    <LoadError message={error} onRetry={() => void reloadTravelFolders()} style={{ marginTop: 48 }} />
                </div>
            );
        }
        return (
            <div className="container">
                <div className="card empty-state" style={{ marginTop: 48 }}>
                    <h3>Reise nicht gefunden</h3>
                    <Link to={TRAVEL_BASE} className="btn">Zu allen Reisen</Link>
                </div>
            </div>
        );
    }

    const others = folders.filter((f) => f.id !== folder.id);
    const sorting = canManage && sortingId === folder.id;
    const tripRecipes = folderRecipes(folder, recipes);
    // a photo may have been deleted while the lightbox was open
    const shown = lightbox !== null && lightbox < count ? lightbox : null;

    return (
        <div className="container">
            <PageHeader
                back={{ to: TRAVEL_BASE, label: "Alle Reisen" }}
                eyebrow={folderSubtitle(folder) ?? "Reise"}
                title={folder.name}
            >
                {canManage && (
                    <div className="travel-toolbar">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                            <Pencil size={16} />
                            Ordner bearbeiten
                        </button>
                        {count > 1 && !sorting && (
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSortingId(folder.id)}>
                                <ArrowDownUp size={16} />
                                Fotos sortieren
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm travel-delete"
                            onClick={() => setToDelete({ kind: "folder" })}
                        >
                            <Trash2 size={16} />
                            Ordner löschen
                        </button>
                    </div>
                )}
            </PageHeader>

            {/* the key ends writing the text when another trip is opened */}
            <TravelFolderText key={folder.id} folder={folder} canManage={canManage} />

            {canManage && !sorting && <TravelPhotoDropzone folderId={folder.id} />}

            {sorting ? (
                <TravelPhotoSorter key={folder.id} folder={folder} onClose={() => setSortingId(null)} />
            ) : count === 0 ? (
                <div className="card empty-state">
                    <span className="empty-state-icon"><Images size={26} /></span>
                    <h3>Noch keine Fotos</h3>
                    <p>{canManage ? "Zieh die ersten Fotos in das Feld oben." : "Für diese Reise gibt es noch keine Fotos."}</p>
                </div>
            ) : (
                <div className="gallery">
                    {folder.photos.map((photo, i) => {
                        const photoId = photo.id;
                        return (
                            <div key={photoId} className="gallery-item">
                                <button
                                    type="button"
                                    className="gallery-open"
                                    onClick={() => setLightbox(i)}
                                    aria-label={`${folder.name} – Foto ${i + 1} vergrößern`}
                                >
                                    <img
                                        src={TravelController.photoUrl(photoId)}
                                        alt={photoDescription(folder.name, photo, i)}
                                        loading={i < 2 ? "eager" : "lazy"}
                                    />
                                </button>
                                {canManage && (
                                    <div className="gallery-actions">
                                        <button
                                            type="button"
                                            className="gallery-action gallery-action--delete"
                                            onClick={() => setToDelete({ kind: "photo", photoId, number: i + 1 })}
                                            aria-label={`Foto ${i + 1} löschen`}
                                            title="Foto löschen"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {tripRecipes.length > 0 && (
                <section className="section">
                    <h2 className="other-destinations-title">Rezepte zur Reise</h2>
                    <div className="recipe-grid">
                        {tripRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
                    </div>
                </section>
            )}

            {others.length > 0 && (
                <section className="section">
                    <h2 className="other-destinations-title">Weitere Reisen</h2>
                    <div className="other-destinations">
                        {others.map((other) => <TravelFolderLink key={other.id} folder={other} />)}
                    </div>
                </section>
            )}

            {shown !== null && (
                <TravelLightbox
                    name={folder.name}
                    photos={folder.photos}
                    canManage={canManage}
                    index={shown}
                    onIndexChange={setLightbox}
                    onClose={() => setLightbox(null)}
                />
            )}

            <TravelFolderDialog
                open={editing}
                folder={folder}
                onClose={() => setEditing(false)}
                onSaved={() => setEditing(false)}
            />

            <DeleteDialog
                folder={folder}
                target={toDelete}
                onClose={() => setToDelete(null)}
                onDeleted={(target) => {
                    setToDelete(null);
                    if (target.kind === "folder") navigate(TRAVEL_BASE);
                }}
            />
        </div>
    );
}

function DeleteDialog({ folder, target, onClose, onDeleted }: {
    folder: TravelFolder;
    target: DeleteTarget | null;
    onClose: () => void;
    onDeleted: (target: DeleteTarget) => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function close() {
        if (busy) return;
        setError(null);
        onClose();
    }

    async function confirm() {
        if (!target) return;
        setBusy(true);
        setError(null);
        try {
            if (target.kind === "photo") {
                await TravelController.deletePhoto(target.photoId);
                dropTravelPhoto(folder.id, target.photoId);
                onDeleted(target);
            } else {
                await TravelController.deleteFolder(folder.id);
                // leave the page first, so it doesn't show "not found" for a moment
                onDeleted(target);
                dropTravelFolder(folder.id);
            }
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setBusy(false);
        }
    }

    const isFolder = target?.kind === "folder";

    return (
        <Dialog open={target !== null} onClose={close} labelledBy="delete-travel-title" className="confirm-dialog">
            <h2 id="delete-travel-title">{isFolder ? "Ordner löschen?" : "Foto löschen?"}</h2>
            <p className="muted">
                {isFolder
                    ? `„${folder.name}“ wird dauerhaft gelöscht${folder.photos.length > 0 ? ` – zusammen mit ${photoCountLabel(folder.photos.length)}` : ""}.`
                    : `Foto ${target?.kind === "photo" ? target.number : ""} aus „${folder.name}“ wird dauerhaft gelöscht.`}
            </p>
            {target?.kind === "photo" && (
                <img className="travel-delete-preview" src={TravelController.photoUrl(target.photoId)} alt="" />
            )}
            {error && <p className="form-message form-message--error" role="alert">{error}</p>}
            <div className="profile-form-actions">
                <button type="button" className="btn btn-ghost" onClick={close} disabled={busy}>
                    Abbrechen
                </button>
                <button type="button" className="btn btn-danger" onClick={confirm} disabled={busy}>
                    {busy ? "Wird gelöscht …" : "Löschen"}
                </button>
            </div>
        </Dialog>
    );
}
