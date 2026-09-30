import { Link } from "react-router-dom";
import { openCookieSettings } from "../CookieConsent";

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container">
                <span>© {new Date().getFullYear()} Jan · jan-website.de</span>
                <nav aria-label="Footer">
                    <Link to="/">Reisen</Link>
                    <Link to="/cookbook">Kochbuch</Link>
                    <button type="button" onClick={openCookieSettings}>Cookie-Einstellungen</button>
                </nav>
            </div>
        </footer>
    );
}
