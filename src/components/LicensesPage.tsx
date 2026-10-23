import { useEffect, useState } from "react";
import LicenseController from "../controller/LicenseController";
import { usePageTitle } from "../hooks/usePageTitle";
import PageHeader from "./layout/PageHeader";
import Spinner from "./ui/Spinner";

/** A package of the website with its license, as scripts/licensesPlugin.ts writes it into the build. */
interface PackageLicense {
    name: string;
    version: string;
    license: string;
    repository: string | null;
    licenseText: string | null;
    noticeText: string | null;
}

/** Written by the build, so it only exists in a built website, not with the dev server. */
const FRONTEND_LICENSES = "/licenses/frontend.json";

async function loadFrontendLicenses(): Promise<PackageLicense[]> {
    const response = await fetch(FRONTEND_LICENSES);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

/** What a load gave: null while it runs, failed when it didn't work. */
function useLoaded<T>(load: () => Promise<T>): { value: T | null; failed: boolean } {
    const [state, setState] = useState<{ value: T | null; failed: boolean }>({ value: null, failed: false });
    useEffect(() => {
        let active = true;
        load().then(
            (value) => active && setState({ value, failed: false }),
            () => active && setState({ value: null, failed: true }),
        );
        return () => {
            active = false;
        };
    }, [load]);
    return state;
}

/** The open source software the website and its server are built with, and its licenses. */
export default function LicensesPage() {
    usePageTitle("Open-Source-Lizenzen");
    const { value: packages, failed } = useLoaded(loadFrontendLicenses);
    const backend = useLoaded(LicenseController.listBackendLicenses);

    return (
        <div className="container privacy">
            <PageHeader title="Open-Source-Lizenzen" back={{ to: "/", label: "Zur Startseite" }} />

            <div className="card card-pad privacy-text">
                <p>
                    Diese Website baut auf freier Software auf. Hier stehen die Pakete, die sie dafür mitbringt,
                    jeweils mit ihrer Lizenz. Ein Klick auf ein Paket zeigt den Lizenztext.
                </p>

                <h2>Karte und Daten</h2>
                <ul>
                    <li>
                        Die Karte im Reisetagebuch und die Ortssuche (Nominatim) nutzen Daten von{" "}
                        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>:
                        © OpenStreetMap-Mitwirkende, verfügbar unter der Open Database License (ODbL).
                    </li>
                    <li>
                        Die Wortlisten der Japanisch-Spiele stammen aus dem Repository{" "}
                        <a href="https://github.com/JanR99/japanese-practice" target="_blank" rel="noopener noreferrer">japanese-practice</a>.
                    </li>
                </ul>

                <h2>Website</h2>
                {failed ? (
                    <p className="muted">
                        {import.meta.env.DEV
                            ? "Die Liste entsteht erst beim Build (npm run build)."
                            : "Die Liste konnte gerade nicht geladen werden."}
                    </p>
                ) : packages === null ? (
                    <Spinner />
                ) : (
                    <ul className="license-list">
                        {packages.map((pkg) => (
                            <li key={`${pkg.name}@${pkg.version}`}>
                                <details>
                                    <summary>
                                        <strong>{pkg.name}</strong> <span className="muted">{pkg.version} · {pkg.license}</span>
                                    </summary>
                                    {pkg.repository && (
                                        <p><a href={pkg.repository} target="_blank" rel="noopener noreferrer">Quellcode</a></p>
                                    )}
                                    {pkg.licenseText ? (
                                        <pre className="license-text">{pkg.licenseText}</pre>
                                    ) : (
                                        <p className="muted">
                                            Das Paket bringt keinen eigenen Lizenztext mit, es steht unter der{" "}
                                            <a href={`https://spdx.org/licenses/${pkg.license}.html`} target="_blank" rel="noopener noreferrer">
                                                {pkg.license}
                                            </a>
                                            -Lizenz.
                                        </p>
                                    )}
                                    {pkg.noticeText && <pre className="license-text">{pkg.noticeText}</pre>}
                                </details>
                            </li>
                        ))}
                    </ul>
                )}

                <h2>Server</h2>
                {backend.failed ? (
                    <p className="muted">Die Liste konnte gerade nicht geladen werden.</p>
                ) : backend.value === null ? (
                    <Spinner />
                ) : backend.value.length === 0 ? (
                    <p className="muted">Die Liste entsteht erst beim Build des Servers (mvn package).</p>
                ) : (
                    <>
                        <p className="muted">Die Bibliotheken des Servers; die Lizenztexte stehen auf den Seiten der Projekte.</p>
                        <ul className="license-list">
                            {backend.value.map((library) => (
                                <li key={library.artifact}>
                                    <strong>{library.name}</strong>{" "}
                                    <span className="muted">{library.version} · {library.licenses.join(", ") || "ohne Angabe"}</span>
                                    {library.url && (
                                        <>
                                            {" · "}
                                            <a href={library.url} target="_blank" rel="noopener noreferrer">Website</a>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}
