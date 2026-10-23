import { useEffect, useState } from "react";
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

/** The open source software the website is built with, and its licenses. */
export default function LicensesPage() {
    usePageTitle("Open-Source-Lizenzen");
    const [packages, setPackages] = useState<PackageLicense[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let active = true;
        fetch(FRONTEND_LICENSES)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then((list: PackageLicense[]) => active && setPackages(list))
            .catch(() => active && setFailed(true));
        return () => {
            active = false;
        };
    }, []);

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
            </div>
        </div>
    );
}
