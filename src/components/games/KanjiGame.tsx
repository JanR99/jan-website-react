import { useJapaneseKanji } from "../../hooks/useJapaneseWords";
import { usePageTitle } from "../../hooks/usePageTitle";
import PageHeader from "../layout/PageHeader";
import LoadError from "../ui/LoadError";
import Spinner from "../ui/Spinner";
import KanjiSetup from "./kanji/KanjiSetup";
import { GAMES_BASE } from "./paths";
import "../../styles/Cookbook.css";
import "../../styles/Games.css";

/**
 * Kanji words with their meaning: the reading is typed in romaji, or the other way round the kanji is chosen
 * for reading and meaning. The parts are in ./kanji.
 */
export default function KanjiGame() {
    usePageTitle("Kanji lesen");
    const { words, failed, retry } = useJapaneseKanji();

    return (
        <div className="container kanji-page">
            <PageHeader back={{ to: GAMES_BASE, label: "Alle Spiele" }} title="Kanji lesen" />
            {failed ? (
                <LoadError message="Die Kanji konnten nicht geladen werden." onRetry={retry} />
            ) : words === null ? (
                <Spinner />
            ) : (
                <KanjiSetup words={words} />
            )}
        </div>
    );
}
