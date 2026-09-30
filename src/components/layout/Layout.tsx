import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "./Footer";
import CookieConsent from "../CookieConsent";
import AuthDialog from "../auth/AuthDialog";

export default function Layout() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="app-shell">
            <a href="#main" className="visually-hidden">Zum Inhalt springen</a>
            <Navbar />
            <main id="main" className="app-main">
                <Outlet />
            </main>
            <Footer />
            <AuthDialog />
            <CookieConsent />
        </div>
    );
}
