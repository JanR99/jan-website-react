import { Link } from "react-router-dom";
import { openCookieSettings } from "../CookieConsent";
import { TRAVEL_BASE } from "../../utils/travel";

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container">
                <span>© {new Date().getFullYear()} Jan · jan-website.de</span>
                <nav aria-label="Footer">
                    <Link to={TRAVEL_BASE}>Reisen</Link>
                    <Link to="/cookbook">Kochbuch</Link>
                    <button type="button" onClick={openCookieSettings}>Cookie-Einstellungen</button>
                </nav>
            </div>
        </footer>
    );
}
