import { useJapaneseWords } from "../../hooks/useJapaneseWords";
import { usePageTitle } from "../../hooks/usePageTitle";
import PageHeader from "../layout/PageHeader";
import LoadError from "../ui/LoadError";
import CrosswordSetup from "./crossword/CrosswordSetup";
import { GAMES_BASE } from "./paths";
import "../../styles/Cookbook.css";
import "../../styles/Games.css";

/**
 * A crossword of Japanese words: the squares take kana, chosen on a small kana keyboard below the grid.
 * The parts are in ./crossword.
 */
export default function CrosswordGame() {
    usePageTitle("Kreuzworträtsel");
    const { words, failed, retry } = useJapaneseWords();

    return (
        <div className="container crossword-page">
            {/* kept small, so grid and keyboard fit on the screen together */}
            <PageHeader back={{ to: GAMES_BASE, label: "Alle Spiele" }} title="Kreuzworträtsel" />
            {failed ? (
                <LoadError message="Die Wörter konnten nicht geladen werden." onRetry={retry} />
            ) : words === null ? (
                <div className="loading"><div className="spinner" /></div>
            ) : (
                <CrosswordSetup words={words} />
            )}
        </div>
    );
}
