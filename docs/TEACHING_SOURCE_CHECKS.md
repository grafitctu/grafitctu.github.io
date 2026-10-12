# Teaching source checks

The current source registry is `vyuka/upstream-sources.json`. Run
`tools/check_teaching_upstream.py <site-checkout> --source-workspace <author-workspace>`.
The teaching workspace maintains the same checker at `tools/check_teaching_upstream.py`.
Its default output is `output/teaching-weekly/<date>/upstream-check.json` in the
author workspace. Use `--output <directory>` for a repair/recheck so a delivered
weekly report is preserved. No additional Discord delivery is required for repairs.

## Verified URL repairs, 12 October 2026

All five broken VHS hrefs resolve to real files in the author's `media` directory:

| Broken filename | Verified filename |
| --- | --- |
| `26PG1_DS</em>b.pdf` | `26PG1_DS__b.pdf` |
| `26PG1_DS<em>w.pdf` | `26PG1_DS__w.pdf` |
| `26VHS_DS__w.pdf` | `26PG1_DS__w.pdf` |
| `26VHS_dualita.pdf` | `26PG1_dualita.pdf` |
| `26VHS_svetlo.pdf` | `26PG1_svetlo.pdf` |

The verified files are under `https://courses.fit.cvut.cz/BI-VHS/media/`.
Their contents are ray-tracing acceleration structures (two 77-page editions),
Delaunay/Voronoi duality (64 pages), and light/optics (45 pages). They are existing
March 2026 working references, not newly published lectures. Full source hashes
are in the registry. `mirrored:false` remains explicit.

`urlRepairs` preserves the original href, replacement, reason and repository
evidence. The checker applies these aliases to plan discovery; it does not invent
new lectures when the original plan still contains a malformed href. Existing
baseline links, source roles, author copies and local-source hashes are retained.
These repairs affect the GRAFIT registry/checker; the original Courses page is
not edited by this change.

## Authenticated FIT sources

MVT's first PDF and VGA's first PDF are available through the authenticated
browser and have the same complete SHA-256 as their existing adaptations.
Their URLs are valid. A CLI redirect to FIT login is not a missing lecture.
The PG2, VGA, EGG, MVT and PVR Courses plans require the same browser session.

After actually reading current plans and downloading the current PDFs through
the supported browser tools, write a **local-only** receipt JSON and pass
`--browser-evidence <receipt.json>`:

```json
{
  "checkedAt": "<current UTC ISO timestamp with offset>",
  "files": [
    {"url": "<registered source URL>", "downloadPath": "<new local download>", "sha256": "<full hash of that download>"}
  ],
  "plans": [
    {"url": "<registered plan URL>", "authenticated": true, "materialLinks": ["<actual current PDF or author HTML link>"]}
  ]
}
```

Use freshly observed DOM links, not copied baseline links. Plan receipts are
identified as `authenticated-browser-dom`, not as a raw HTML source hash.
Receipt timestamps and PDF modification times must be within two hours of the
check. The checker recomputes the entire downloaded PDF hash, validates its PDF
signature and rejects stale files or mismatched hashes. Never refresh receipt
timestamps without repeating the browser checks. No browser credentials,
cookies, account details or receipt file paths belong in the public registry.

New plan links remain discoveries until their contents are reviewed/imported;
observing a link does not update an adaptation's source baseline.

## Explicitly excluded external course

On 12 October 2026 the user confirmed that **DVD has no official website yet**
and requested it be omitted. `sourcePolicies` records `checkExternal:false` for
DVD; it is an explicit exclusion, not an unavailable source and not a claim that
its materials were checked. Existing local author exports remain independently
tracked. When the user supplies an official site, update the policy and register
the real plan URL. The general Courses directory and syllabus metadata alone
are not lecture plans.

The stale 2025 VHS calendar and undated PVR/PG2 plans still do not prove lecture
dates for the 2026 semester. Source availability and calendar verification are
separate questions.
