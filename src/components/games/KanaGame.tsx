import { usePageTitle } from "../../hooks/usePageTitle";
import PageHeader from "../layout/PageHeader";
import KanaSetup from "./kana/KanaSetup";
import { GAMES_BASE } from "./paths";
import "../../styles/Cookbook.css";
import "../../styles/Games.css";

/** Single hiragana and katakana: the romaji is typed, as in "Kanji lesen". The parts are in ./kana. */
export default function KanaGame() {
    usePageTitle("Kana lesen");
    return (
        <div className="container kanji-page">
            <PageHeader back={{ to: GAMES_BASE, label: "Alle Spiele" }} title="Kana lesen" />
            <KanaSetup />
        </div>
    );
}
