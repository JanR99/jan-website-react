import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo-header.png";
import { MAIN_NAV, NavItem } from "../config/navigation";
import { useTheme } from "../hooks/useTheme";
import AccountMenu from "./AccountMenu";
import { Moon, Sun } from "lucide-react";
import "../styles/Navbar.css";

function isActive(item: NavItem, pathname: string) {
    if (item.to === "/") {
        return pathname === "/" || (item.activePrefixes ?? []).some((p) => pathname.startsWith(p));
    }
    return [item.to, ...(item.activePrefixes ?? [])].some((p) => pathname.startsWith(p));
}

export default function Navbar() {
    const { pathname } = useLocation();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="site-header">
            <div className="container site-header-inner">
                <Link to="/" className="site-logo" aria-label="Zur Startseite">
                    <img src={logo} alt="jans-website" width={130} height={41} />
                </Link>

                <nav className="main-nav" aria-label="Hauptnavigation">
                    {MAIN_NAV.map((item) => {
                        const active = isActive(item, pathname);
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`main-nav-link${active ? " is-active" : ""}`}
                                aria-current={active ? "page" : undefined}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="site-header-actions">
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={toggleTheme}
                        aria-label={theme === "dark" ? "Helles Design" : "Dunkles Design"}
                        title={theme === "dark" ? "Helles Design" : "Dunkles Design"}
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <AccountMenu />
                </div>
            </div>
        </header>
    );
}
