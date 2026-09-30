import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ACCOUNT_BASE, ACCOUNT_SECTIONS, accountSectionPath, visibleAccountSections } from "../../config/navigation";
import Avatar from "../ui/Avatar";
import { LogOut } from "lucide-react";
import "../../styles/Account.css";

export default function AccountPage() {
    const { user, logout, permissions } = useAuth();
    const { pathname } = useLocation();
    const sections = visibleAccountSections(permissions);

    const current =
        ACCOUNT_SECTIONS.find((s) => s.path && pathname.startsWith(`${ACCOUNT_BASE}/${s.path}`)) ??
        ACCOUNT_SECTIONS.find((s) => s.path === "");

    if (!user) return null;

    return (
        <div className="container account-layout">
            <aside className="account-sidebar">
                <div className="account-sidebar-user">
                    <Avatar user={user} size={48} />
                    <div>
                        <strong>{user.firstname} {user.lastname}</strong>
                        <span>{user.email}</span>
                    </div>
                </div>

                <nav className="account-nav" aria-label="Kontobereiche">
                    {sections.map((section) => (
                        <NavLink
                            key={section.path}
                            to={accountSectionPath(section)}
                            end={section.path === ""}
                            className={({ isActive }) => `account-nav-link${isActive ? " is-active" : ""}`}
                        >
                            <section.icon size={18} />
                            <span>{section.label}</span>
                        </NavLink>
                    ))}
                    <button type="button" className="account-nav-link account-nav-logout" onClick={logout}>
                        <LogOut size={18} />
                        <span>Abmelden</span>
                    </button>
                </nav>
            </aside>

            <section className="account-content">
                {current && (
                    <header className="account-content-head">
                        <h1>{current.label}</h1>
                        {current.description && <p className="muted">{current.description}</p>}
                    </header>
                )}
                <Outlet />
            </section>
        </div>
    );
}
