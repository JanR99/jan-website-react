import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "./Footer";
import CookieConsent from "../CookieConsent";
import AuthDialog from "../auth/AuthDialog";
import SessionExpiryNotice from "../auth/SessionExpiryNotice";
import ErrorBoundary from "./ErrorBoundary";
import { appUpdateArrived } from "../../utils/appUpdate";
import { useScrollMemory } from "../../hooks/useScrollMemory";

export default function Layout() {
    const { pathname } = useLocation();
    useScrollMemory();

    useEffect(() => {
        // a release arrived while the page was open: a page change is a good moment to load the new version
        if (appUpdateArrived()) window.location.reload();
    }, [pathname]);

    return (
        <div className="app-shell">
            <Navbar />
            <main className="app-main">
                <ErrorBoundary resetKey={pathname}>
                    <Outlet />
                </ErrorBoundary>
            </main>
            <Footer />
            <AuthDialog />
            <SessionExpiryNotice />
            <CookieConsent />
        </div>
    );
}
