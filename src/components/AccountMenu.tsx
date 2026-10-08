import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.tsx";
import { accountSectionPath, visibleAccountSections } from "../config/navigation.tsx";
import Avatar from "./ui/Avatar.tsx";
import { ChevronDown, LogIn, LogOut } from "lucide-react";
import "../styles/AccountMenu.css";

export default function AccountMenu() {
    const { user, logout, openAuthDialog, permissions } = useAuth();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const [openedOn, setOpenedOn] = useState(pathname);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        };
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    if (openedOn !== pathname) {
        setOpenedOn(pathname);
        setOpen(false);
    }

    if (!user) {
        return (
            <button type="button" className="btn btn-sm" onClick={() => openAuthDialog("login")}>
                <LogIn size={16} />
                Anmelden
            </button>
        );
    }

    const items = visibleAccountSections(permissions).filter((s) => s.showInMenu !== false);

    return (
        <div className="account-menu" ref={rootRef}>
            <button
                type="button"
                className="account-trigger"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={open}
            >
                <Avatar user={user} size={32} />
                <span className="account-trigger-name">{user.firstname || user.email}</span>
                <ChevronDown size={16} className="account-trigger-chevron" />
            </button>

            {open && (
                <div className="account-dropdown">
                    <div className="account-dropdown-head">
                        <Avatar user={user} size={40} />
                        <div>
                            <strong>{[user.firstname, user.lastname].filter(Boolean).join(" ") || "Mein Konto"}</strong>
                            <span>{user.email}</span>
                        </div>
                    </div>

                    <nav className="account-dropdown-list" aria-label="Konto">
                        {items.map((section) => (
                            <Link key={section.path} to={accountSectionPath(section)} className="account-dropdown-item">
                                <section.icon size={18} />
                                {section.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="account-dropdown-footer">
                        <button
                            type="button"
                            className="account-dropdown-item"
                            onClick={() => {
                                logout();
                                setOpen(false);
                            }}
                        >
                            <LogOut size={18} />
                            Abmelden
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
