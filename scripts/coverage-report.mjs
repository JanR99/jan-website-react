// Writes an overview of the test coverage as Markdown: per file the share of covered lines and the lines
// no test runs, as links into the code on GitHub.
//   node scripts/coverage-report.mjs frontend coverage/lcov.info <out.md>
//   node scripts/coverage-report.mjs backend backend/target/site/jacoco/jacoco.xml <out.md>
// The links point to the commit in GITHUB_SHA of GITHUB_REPOSITORY (set in GitHub Actions); without them the
// lines are plain text. In GitHub Actions the overview also goes into the summary of the run.
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";

const [part, report, output] = process.argv.slice(2);
if (!["frontend", "backend"].includes(part) || !report || !output) {
    console.error("usage: node scripts/coverage-report.mjs frontend|backend <report> <out.md>");
    process.exit(1);
}

/** at most this many line ranges per file; the rest is counted */
const MAX_RANGES = 12;

/**
 * @typedef {{ path: string, lines: Map<number, boolean> }} FileCoverage
 * path: from the repository root; lines: line number → covered by a test
 */

/** The files of an LCOV report (Vitest), with the lines that hold code. */
function readLcov(file) {
    /** @type {FileCoverage[]} */
    const files = [];
    let current = null;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
        if (line.startsWith("SF:")) {
            const path = line.slice(3);
            current = { path: path.startsWith("/") ? relative(process.cwd(), path) : path, lines: new Map() };
            files.push(current);
        } else if (line.startsWith("DA:") && current) {
            const [number, hits] = line.slice(3).split(",").map(Number);
            current.lines.set(number, hits > 0);
        }
    }
    return files;
}

/** The source files of a JaCoCo XML report, with the lines that hold code. */
function readJacoco(file) {
    /** @type {FileCoverage[]} */
    const files = [];
    const xml = readFileSync(file, "utf8");
    for (const pkg of xml.matchAll(/<package name="([^"]*)">([\s\S]*?)<\/package>/g)) {
        for (const source of pkg[2].matchAll(/<sourcefile name="([^"]*)">([\s\S]*?)<\/sourcefile>/g)) {
            const lines = new Map();
            for (const line of source[2].matchAll(/<line nr="(\d+)" mi="(\d+)" ci="(\d+)"/g)) {
                lines.set(Number(line[1]), Number(line[3]) > 0);
            }
            files.push({ path: `backend/src/main/java/${pkg[1]}/${source[1]}`, lines });
        }
    }
    return files;
}

/** The lines not covered as ranges [from, to]; lines without code between them don't break a range. */
function uncoveredRanges(lines) {
    const ranges = [];
    let range = null;
    for (const [number, covered] of [...lines].sort((a, b) => a[0] - b[0])) {
        if (covered) {
            range = null;
        } else if (range) {
            range[1] = number;
        } else {
            range = [number, number];
            ranges.push(range);
        }
    }
    return ranges;
}

const repository = process.env.GITHUB_REPOSITORY;
const commit = process.env.GITHUB_SHA;

/** A line or range of lines, as a link into the code when the commit is known. */
function lineLink(path, [from, to]) {
    const text = from === to ? `L${from}` : `L${from}–L${to}`;
    if (!repository || !commit) return text;
    const anchor = from === to ? `L${from}` : `L${from}-L${to}`;
    return `[${text}](https://github.com/${repository}/blob/${commit}/${path}#${anchor})`;
}

function fileLink(path, shown) {
    return repository && commit ? `[${shown}](https://github.com/${repository}/blob/${commit}/${path})` : shown;
}

const percent = (covered, total) => (total === 0 ? 100 : (covered / total) * 100);
const formatPercent = (value) => `${value.toFixed(value === 100 || value === 0 ? 0 : 1).replace(".", ",")} %`;

const files = (part === "frontend" ? readLcov(report) : readJacoco(report))
    .filter((file) => file.lines.size > 0)
    .sort((a, b) => a.path.localeCompare(b.path));

const prefix = part === "frontend" ? "src/" : "backend/src/main/java/";
/** the path below src/ or backend/src/main/java/ */
const shortPath = (path) => (path.startsWith(prefix) ? path.slice(prefix.length) : path);

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;
/** the folder below the root; "(Wurzel)" for files right in it, like src/App.tsx */
const folderOf = (path) => (shortPath(path).includes("/") ? shortPath(path).slice(0, shortPath(path).lastIndexOf("/")) : "(Wurzel)");

/** the files of each folder, folders in alphabetical order */
const grouped = new Map();
for (const file of files) {
    const folder = folderOf(file.path);
    if (!grouped.has(folder)) grouped.set(folder, []);
    grouped.get(folder).push(file);
}
const folders = new Map([...grouped].sort(([a], [b]) => a.localeCompare(b)));

const stats = (list) => {
    const lines = list.reduce((sum, file) => sum + file.lines.size, 0);
    const covered = list.reduce((sum, file) => sum + [...file.lines.values()].filter(Boolean).length, 0);
    const complete = list.filter((file) => [...file.lines.values()].every(Boolean)).length;
    return { lines, covered, complete };
};

const total = stats(files);
const title = part === "frontend" ? "Frontend" : "Backend";
const root = part === "frontend" ? "src/" : "backend/src/main/java/";
const out = [];
out.push(`## ${title}: ${formatPercent(percent(total.covered, total.lines))} der Zeilen getestet`);
out.push("");
out.push(`${total.covered} von ${total.lines} Zeilen mit Code in ${count(files.length, "Datei", "Dateien")} unter \`${root}\`; `
    + `${count(total.complete, "Datei ist", "Dateien sind")} ganz getestet.`);
out.push("");
out.push("| Ordner | Getestet | Dateien ganz getestet |");
out.push("|---|---:|---:|");
for (const [folder, list] of folders) {
    const folderStats = stats(list);
    out.push(`| ${folder} | ${formatPercent(percent(folderStats.covered, folderStats.lines))} (${folderStats.covered}/${folderStats.lines}) | ${folderStats.complete} von ${list.length} |`);
}
out.push("");
out.push("Je Ordner die Dateien mit Zeilen, die kein Test ausführt (die Zeilen führen in den Code):");
out.push("");

for (const [folder, list] of folders) {
    const folderStats = stats(list);
    const open = list.filter((file) => ![...file.lines.values()].every(Boolean));
    const complete = list.filter((file) => [...file.lines.values()].every(Boolean));
    out.push(`<details><summary><b>${folder}</b> – ${formatPercent(percent(folderStats.covered, folderStats.lines))}, ${count(open.length, "Datei", "Dateien")} mit Lücken</summary>`);
    out.push("");
    if (open.length > 0) {
        out.push("| Datei | Getestet | Nicht getestete Zeilen |");
        out.push("|---|---:|---|");
        for (const file of open) {
            const covered = [...file.lines.values()].filter(Boolean).length;
            let untested;
            if (covered === 0) {
                untested = "ganze Datei";
            } else {
                const ranges = uncoveredRanges(file.lines);
                const shown = ranges.slice(0, MAX_RANGES).map((range) => lineLink(file.path, range));
                if (ranges.length > MAX_RANGES) shown.push(`… und ${ranges.length - MAX_RANGES} weitere`);
                untested = shown.join(" · ");
            }
            const name = file.path.slice(file.path.lastIndexOf("/") + 1);
            out.push(`| ${fileLink(file.path, name)} | ${formatPercent(percent(covered, file.lines.size))} (${covered}/${file.lines.size}) | ${untested} |`);
        }
        out.push("");
    }
    if (complete.length > 0) {
        out.push(`Ganz getestet: ${complete.map((file) => fileLink(file.path, file.path.slice(file.path.lastIndexOf("/") + 1))).join(" · ")}`);
        out.push("");
    }
    out.push("</details>");
    out.push("");
}

const markdown = out.join("\n");
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, markdown);
console.log(`${title}: ${files.length - total.complete} of ${files.length} files with lines not tested, written to ${output}`);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
