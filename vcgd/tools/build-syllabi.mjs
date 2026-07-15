import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const vcgdDir = path.resolve(here, "..");
const legacyPath = path.resolve(vcgdDir, "..", "vcgd.html");
const outputPath = path.join(vcgdDir, "syllabi-cs.js");

const legacy = fs.readFileSync(legacyPath, "utf8");
const marker = "const COURSE_DETAILS = ";
const start = legacy.indexOf(marker);

if (start === -1) {
  throw new Error("COURSE_DETAILS was not found in vcgd.html");
}

const objectStart = start + marker.length;
const objectEnd = legacy.indexOf("\n};", objectStart);

if (objectEnd === -1) {
  throw new Error("The end of COURSE_DETAILS was not found in vcgd.html");
}

const raw = vm.runInNewContext(`(${legacy.slice(objectStart, objectEnd + 2)})`);
const aliases = {
  DVD: "ANI-DVD",
  ESC: "NI-ESC",
  TVR: "ANI-TVR",
  NUR: "ANI-NUR",
  CCC: "ANI-CCC",
  DID: "ANI-DID",
  "ANI-TPb": "ANI-TPB",
  VGA: "ANI-VGA",
  PVR: "ANI-PVR",
  BSO: "ANI-BSO",
  IRT: "ANI-IRT",
  GPU: "NI-GPU",
  SSD: "ANI-SSD",
  "ANI-TPa": "ANI-TPA"
};

const syllabi = {};

for (const [legacyKey, course] of Object.entries(raw)) {
  if (legacyKey === "xIRT") continue;

  const code = aliases[legacyKey] || course.code.toUpperCase();
  syllabi[code] = {
    ...course,
    code,
    sourceLabel: "Oficiální katalog FIT ČVUT"
  };
}

syllabi.UEE = {
  code: "UEE",
  name: "Environmentální design v Unreal Engine",
  extent: "bude upřesněno",
  credits: "2",
  semester: "Z",
  ending: "bude upřesněno",
  url: "",
  planned: true,
  sourceLabel: "Připravovaný předmět",
  sections: [
    {
      title: "Stav předmětu",
      type: "p",
      content: "Předmět je ve fázi přípravy. Oficiální sylabus, způsob zakončení a rozsah výuky zatím nebyly zveřejněny v katalogu FIT ČVUT."
    },
    {
      title: "Předběžné zaměření",
      type: "p",
      content: "Praktický návrh a tvorba interaktivních prostředí s využitím pracovního postupu mezi nástroji pro 3D tvorbu a Unreal Engine."
    }
  ]
};

const ordered = Object.fromEntries(Object.entries(syllabi).sort(([a], [b]) => a.localeCompare(b)));
const output = `/* Generated from the legacy VCGD course data. Run tools/build-syllabi.mjs to rebuild. */\nwindow.VCGD_SYLLABI = ${JSON.stringify(ordered, null, 2)};\n`;

fs.writeFileSync(outputPath, output, "utf8");
console.log(`Wrote ${Object.keys(ordered).length} Czech syllabi to ${outputPath}`);
