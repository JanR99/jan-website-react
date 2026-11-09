import { useJapaneseKanji, useJapaneseWords, useVocabExtra } from "../../hooks/useJapaneseWords";
import { usePageTitle } from "../../hooks/usePageTitle";
import PageHeader from "../layout/PageHeader";
import LoadError from "../ui/LoadError";
import Spinner from "../ui/Spinner";
import { GAMES_BASE } from "./paths";
import VocabSetup from "./vocab/VocabSetup";
import "../../styles/Cookbook.css";
import "../../styles/Games.css";

/** Japanese words with spaced repetition: the English meaning is typed. The parts are in ./vocab. */
export default function VocabGame() {
    usePageTitle("Vokabeln");
    const kanji = useJapaneseKanji();
    const kana = useJapaneseWords();
    const extra = useVocabExtra();
    const retry = () => {
        if (kanji.failed) kanji.retry();
        if (kana.failed) kana.retry();
        if (extra.failed) extra.retry();
    };

    return (
        <div className="container kanji-page">
            <PageHeader back={{ to: GAMES_BASE, label: "Alle Spiele" }} title="Vokabeln" />
            {kanji.failed || kana.failed || extra.failed ? (
                <LoadError message="Die Wörter konnten nicht geladen werden." onRetry={retry} />
            ) : kanji.words === null || kana.words === null || extra.words === null ? (
                <Spinner />
            ) : (
                <VocabSetup kanji={kanji.words} kana={kana.words} extra={extra.words} />
            )}
        </div>
    );
}
