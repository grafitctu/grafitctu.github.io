import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const vcgdDir = path.resolve(here, "..");
const legacyPath = path.join(vcgdDir, "archive", "vcgd-legacy-2026-07-15.html");
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
  extent: "4denní bloková výuka",
  credits: "2",
  semester: "blokově na začátku zkouškového období",
  url: "",
  lecturers: ["Daniel Tripplet (Purdue University)"],
  sourceLabel: "Podklady VCGD · uskutečněná bloková výuka",
  sections: [
    {
      title: "Anotace",
      type: "p",
      content: "Intenzivní praktický předmět zaměřený na tvorbu interaktivních 3D prostředí v Unreal Engine. Výuka propojuje práci v Unreal Engine se základní přípravou 3D obsahu v Blenderu a s pořízením a využitím 3D skenů reálných objektů."
    },
    {
      title: "Výstupy učení",
      type: "ul",
      content: [
        "vytvořit a upravit jednoduché interaktivní 3D prostředí v Unreal Engine",
        "připravit základní 3D obsah v Blenderu pro použití v Unreal Engine",
        "pořídit 3D sken objektu a začlenit naskenovaný objekt do prostředí v Unreal Engine"
      ]
    },
    {
      title: "Obsah blokové výuky",
      type: "ul",
      content: [
        "praktická práce s Unreal Engine při tvorbě interaktivního prostředí",
        "základní workflow mezi Blenderem a Unreal Engine",
        "krátký praktický kurz 3D skenování objektů",
        "zpracování a využití naskenovaných objektů v Unreal Engine",
        "propojení uvedených postupů při tvorbě 3D prostředí"
      ]
    },
    {
      title: "Organizace výuky",
      type: "p",
      content: "Předmět proběhl jako čtyřdenní blok na začátku zkouškového období. Výuku vedl Daniel Tripplet z Purdue University. Rozsah předmětu je 2 ECTS."
    },
    {
      title: "Další běh předmětu",
      type: "p",
      content: "S obdobným čtyřdenním blokovým formátem se počítá také v následujícím akademickém roce. Konkrétní termín bude oznámen samostatně."
    }
  ]
};

const ordered = Object.fromEntries(Object.entries(syllabi).sort(([a], [b]) => a.localeCompare(b)));
const output = `/* Generated from the legacy VCGD course data. Run tools/build-syllabi.mjs to rebuild. */\nwindow.VCGD_SYLLABI = ${JSON.stringify(ordered, null, 2)};\n`;

fs.writeFileSync(outputPath, output, "utf8");
console.log(`Wrote ${Object.keys(ordered).length} Czech syllabi to ${outputPath}`);
