import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "./Footer";
import CookieConsent from "../CookieConsent";
import AuthDialog from "../auth/AuthDialog";
import ErrorBoundary from "./ErrorBoundary";
import { appUpdateArrived } from "../../utils/appUpdate";

export default function Layout() {
    const { pathname } = useLocation();

    useEffect(() => {
        // a release arrived while the page was open: a page change is a good moment to load the new version
        if (appUpdateArrived()) {
            window.location.reload();
            return;
        }
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="app-shell">
            <a href="#main" className="visually-hidden">Zum Inhalt springen</a>
            <Navbar />
            <main id="main" className="app-main">
                <ErrorBoundary resetKey={pathname}>
                    <Outlet />
                </ErrorBoundary>
            </main>
            <Footer />
            <AuthDialog />
            <CookieConsent />
        </div>
    );
}
