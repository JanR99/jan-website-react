// Draws a coverage badge (like the ones of shields.io) from a coverage report, for the README.
//   node scripts/coverage-badge.mjs <label> <report> <badge.svg>
// The report is coverage/coverage-summary.json of Vitest or jacoco.csv of JaCoCo; the badge shows the share of
// covered lines. In GitHub Actions the number also goes into the summary of the run.
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const [label, report, output] = process.argv.slice(2);
if (!label || !report || !output) {
    console.error("usage: node scripts/coverage-badge.mjs <label> <report> <badge.svg>");
    process.exit(1);
}

/** Covered lines in percent, from a Vitest summary or a JaCoCo CSV report. */
function linePercent(file) {
    const text = readFileSync(file, "utf8");
    if (file.endsWith(".json")) return JSON.parse(text).total.lines.pct;
    const [header, ...rows] = text.trim().split(/\r?\n/).map((line) => line.split(","));
    const missedColumn = header.indexOf("LINE_MISSED");
    const coveredColumn = header.indexOf("LINE_COVERED");
    let missed = 0;
    let covered = 0;
    for (const row of rows) {
        missed += Number(row[missedColumn]);
        covered += Number(row[coveredColumn]);
    }
    return missed + covered === 0 ? 0 : (covered / (missed + covered)) * 100;
}

/** The colours of shields.io, from red to bright green. */
function color(percent) {
    if (percent >= 90) return "#4c1";
    if (percent >= 75) return "#97ca00";
    if (percent >= 60) return "#a4a61d";
    if (percent >= 40) return "#dfb317";
    if (percent >= 20) return "#fe7d37";
    return "#e05d44";
}

/** Roughly the width of a text in 11px Verdana, which the badge uses. */
const textWidth = (text) => [...text].reduce((width, char) => width + (/[il.,:;|!' ]/.test(char) ? 4 : /[mwMW%]/.test(char) ? 10 : 7), 0);

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function badge(left, right, fill) {
    const leftWidth = textWidth(left) + 12;
    const rightWidth = textWidth(right) + 12;
    const width = leftWidth + rightWidth;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${escape(left)}: ${escape(right)}">
  <title>${escape(left)}: ${escape(right)}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${width}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="20" fill="#555"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${fill}"/>
    <rect width="${width}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${leftWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${escape(left)}</text>
    <text x="${leftWidth / 2}" y="14">${escape(left)}</text>
    <text x="${leftWidth + rightWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${escape(right)}</text>
    <text x="${leftWidth + rightWidth / 2}" y="14">${escape(right)}</text>
  </g>
</svg>
`;
}

const percent = linePercent(report);
const shown = `${Math.round(percent)}%`;
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, badge(label, shown, color(percent)));
console.log(`${label}: ${percent.toFixed(1)} % of the lines covered`);

if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `**${label}:** ${percent.toFixed(1)} % der Zeilen abgedeckt\n\n`);
}
