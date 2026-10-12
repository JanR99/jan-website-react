import { Link } from "react-router-dom";
import { ArrowRight, Grid3x3 } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";
import PageHeader from "../layout/PageHeader";
import { CROSSWORD_PATH } from "./paths";
import "../../styles/Games.css";

/** The overview of the small games; for now there is the Japanese crossword. */
export default function GamesPage() {
    usePageTitle("Spiele");

    return (
        <div className="container">
            <PageHeader eyebrow="Spielen & Lernen" title="Spiele" lead="Kleine Spiele zum Japanisch-Lernen." />

            <div className="games-grid">
                <Link to={CROSSWORD_PATH} className="game-card card">
                    <span className="game-card-icon"><Grid3x3 size={26} /></span>
                    <strong>Kreuzworträtsel</strong>
                    <span className="muted">Japanische Wörter in Hiragana und Katakana zu englischen Hinweisen.</span>
                    <span className="game-card-cta">Spielen <ArrowRight size={16} /></span>
                </Link>
            </div>
        </div>
    );
}
