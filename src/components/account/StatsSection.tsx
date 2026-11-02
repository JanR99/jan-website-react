import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatsController from "../../controller/StatsController";
import { handleApiError } from "../../controller/util/ErrorHandler";
import { useRecipes } from "../../hooks/useRecipes";
import { useTravelFolders } from "../../hooks/useTravelFolders";
import { pageLabel, shortDay, visitsOfLastDays } from "../../utils/stats";
import { OTHER_PAGE } from "../../utils/visits";
import LoadError from "../ui/LoadError";
import Spinner from "../ui/Spinner";
import PermissionGate from "./PermissionGate";

const VisitsChart = lazy(() => import("./VisitsChart"));

/** How many visits the website had in the last 30 days and which pages were opened most. */
export default function StatsSection() {
    return <PermissionGate permission="VIEW_STATS"><Stats /></PermissionGate>;
}

function Stats() {
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // state is only set in the callbacks, once the answer has arrived
    const load = useCallback(() => StatsController.getStats().then(
        (loaded) => {
            setStats(loaded);
            setError(null);
        },
        (err) => setError(handleApiError(err)),
    ), []);

    useEffect(() => {
        void load();
    }, [load]);

    if (error && !stats) {
        return <LoadError message={`Die Statistik konnte nicht geladen werden. ${error}`} onRetry={() => void load()} />;
    }
    if (!stats) {
        return <Spinner />;
    }

    return (
        <div className="account-stack">
            <div className="account-tiles">
                <StatTile label="Besuche heute" value={visitsOfLastDays(stats.days, 1)} />
                <StatTile label="Besuche in 7 Tagen" value={visitsOfLastDays(stats.days, 7)} />
                <StatTile label="Besuche in 30 Tagen" value={visitsOfLastDays(stats.days, 30)} />
            </div>
            <VisitsSection days={stats.days} />
            <TopPages pages={stats.pages} />
            <p className="muted stats-note">
                Gezählt wird ein Besuch einmal pro Browser-Tab und jede aufgerufene Seite, ohne Cookies und ohne IP-Adressen.
                Wer die Statistik sehen darf, wird nicht mitgezählt.
            </p>
        </div>
    );
}

function StatTile({ label, value }: { label: string; value: number }) {
    return (
        <div className="account-tile card">
            <strong>{value.toLocaleString("de-DE")}</strong>
            <span className="muted">{label}</span>
        </div>
    );
}

/** The chart of the last 30 days, with the numbers as a table to open. */
function VisitsSection({ days }: { days: StatsResponse["days"] }) {
    return (
        <section className="card card-pad">
            <h2 className="account-card-title">Besuche pro Tag</h2>
            <Suspense fallback={<div className="stats-chart" />}>
                <VisitsChart days={days} />
            </Suspense>
            <details className="stats-table">
                <summary>Als Tabelle</summary>
                <table>
                    <thead>
                        <tr><th scope="col">Tag</th><th scope="col">Besuche</th><th scope="col">Seitenaufrufe</th></tr>
                    </thead>
                    <tbody>
                        {[...days].reverse().map((day) => (
                            <tr key={day.day}><td>{shortDay(day.day)}</td><td>{day.visits}</td><td>{day.pageViews}</td></tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </section>
    );
}

function TopPages({ pages }: { pages: StatsResponse["pages"] }) {
    const { recipes } = useRecipes();
    const { folders } = useTravelFolders();

    return (
        <section className="card card-pad">
            <h2 className="account-card-title">Meistbesuchte Seiten</h2>
            {pages.length === 0 ? (
                <p className="muted">In den letzten 30 Tagen wurde noch keine Seite aufgerufen.</p>
            ) : (
                <ol className="stats-pages">
                    {pages.map(({ page, views }) => (
                        <li key={page}>
                            {page === OTHER_PAGE
                                ? <span>{pageLabel(page, recipes, folders)}</span>
                                : <Link to={page}>{pageLabel(page, recipes, folders)}</Link>}
                            <span className="muted">{views.toLocaleString("de-DE")}</span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
