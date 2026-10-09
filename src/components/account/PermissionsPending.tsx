import { useAuth } from "../auth/AuthContext";
import LoadError from "../ui/LoadError";

/** What an admin area shows as long as it isn't known what the user may do. */
export default function PermissionsPending() {
    const { permissionsFailed, retryPermissions } = useAuth();

    return permissionsFailed ? (
        <LoadError message="Deine Rechte konnten nicht geladen werden." onRetry={retryPermissions} />
    ) : (
        <div className="loading"><div className="spinner" /></div>
    );
}
