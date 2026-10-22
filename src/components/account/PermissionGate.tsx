import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Permission, PERMISSIONS } from "../../types/roles";
import LoadError from "../ui/LoadError";

/**
 * Shows an admin area only to users with its permission. As long as it isn't known what the user may do,
 * it shows that it is loading (or that loading failed); without the permission, that it is missing.
 */
export default function PermissionGate({ permission, children }: { permission: Permission; children: ReactNode }) {
    const { permissions, permissionsFailed, retryPermissions } = useAuth();

    if (permissions === null) {
        return permissionsFailed ? (
            <LoadError message="Deine Rechte konnten nicht geladen werden." onRetry={retryPermissions} />
        ) : (
            <div className="loading"><div className="spinner" /></div>
        );
    }

    if (!permissions.includes(permission)) {
        return (
            <div className="card empty-state">
                <span className="empty-state-icon"><Lock size={26} /></span>
                <h3>Keine Berechtigung</h3>
                <p>Für diesen Bereich brauchst du das Recht „{PERMISSIONS[permission]}“.</p>
            </div>
        );
    }

    return <>{children}</>;
}
