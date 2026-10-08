import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { openCookieSettings } from "../CookieConsent";
import FeedbackDialog from "../FeedbackDialog";
import { TRAVEL_BASE } from "../../utils/travel";

export default function Footer() {
    const { user, openAuthDialog } = useAuth();
    const [feedbackOpen, setFeedbackOpen] = useState(false);

    // feedback needs an account: guests are asked to log in first
    const openFeedback = () => (user ? setFeedbackOpen(true) : openAuthDialog("login"));

    return (
        <footer className="site-footer">
            <div className="container">
                <span>© {new Date().getFullYear()} Jan · jan-website.de</span>
                <nav aria-label="Footer">
                    <Link to={TRAVEL_BASE}>Reisen</Link>
                    <Link to="/cookbook">Kochbuch</Link>
                    <button type="button" onClick={openFeedback}>Feedback geben</button>
                    <button type="button" onClick={openCookieSettings}>Cookie-Einstellungen</button>
                </nav>
            </div>
            <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
        </footer>
    );
}
