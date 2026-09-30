import { UserDTO } from "../../types/entities";

function initials(user: UserDTO) {
    const fromName = `${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.trim();
    return (fromName || user.email[0] || "?").toUpperCase();
}

export default function Avatar({ user, size = 36 }: { user: UserDTO; size?: number }) {
    return (
        <span
            className="avatar"
            style={{ width: size, height: size, fontSize: size * 0.4 }}
            aria-hidden="true"
        >
            {initials(user)}
        </span>
    );
}
