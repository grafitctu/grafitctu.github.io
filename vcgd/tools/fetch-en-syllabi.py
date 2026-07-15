from __future__ import annotations

import copy
import json
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urljoin

from lxml import html


VCGD_DIR = Path(__file__).resolve().parent.parent
CS_PATH = VCGD_DIR / "syllabi-cs.js"
EN_PATH = VCGD_DIR / "syllabi-en.js"
PREFIX = "window.VCGD_SYLLABI = "
CATALOGUE_INDEX = "https://bk.fit.cvut.cz/en/predmety/predmetyAll.html"
CATALOGUE_BASE = "https://bk.fit.cvut.cz/en/predmety/"
CODE_ALIASES = {
    "ANI-CCC": "NI-CCC",
    "ANI-DID": "NI-DID",
    "ANI-TVR": "NI-TVR",
}
CATALOGUE_ENGLISH_OVERRIDES = {
    "ANI-ARC": {
        "Seminar syllabus": "To be added.",
        "Requirements": "Credit is awarded for assignments and tests of theoretical and practical knowledge during the semester. The examination emphasizes connecting the acquired theoretical and practical knowledge and applying it in an implementation.",
    },
    "ANI-BSO": {
        "Seminar syllabus": "To be added.",
    },
    "ANI-DVG": {
        "Seminar syllabus": "To be added.",
    },
    "ANI-EGG": {
        "Annotation": "This practice-oriented course introduces game engines, their underlying principles and their use in game development. Teaching focuses on general concepts of development in graphics engines and their application in tools such as Unity or Godot. Seminars emphasize hands-on work with engines and independent projects. Students learn to use editors, create scenes, implement animations, interact with objects, design dialogue and apply advanced graphics techniques. The acquired knowledge is put into practice in semester projects. The course is intended for students interested in game development who want a solid foundation in modern graphics engines and an understanding of how game applications are created.",
        "Seminar syllabus": "To be added.",
    },
    "ANI-IRT": {
        "Annotation": "The course focuses on principles and current technologies for real-time network transmission. The syllabus covers the capture and presentation of audiovisual signals, network protocols used for transmission, device interfaces, codecs, data formats and stereoscopy. Attention is given to practical uses of real-time AV transmission. In seminars, students assemble a complete AV transmission chain using hardware and software components, examine how individual components affect quality and latency, and learn how to provide the network infrastructure required for high-quality AV transmission from scene capture to presentation to users.",
        "Seminar syllabus": "To be added.",
    },
    "ANI-SAI": {
        "Annotation": "Students become familiar with applied statistical methods and their theoretical foundations. They learn to work with different types of data, carry out analyses and choose a model appropriate to the data. The course covers regression and correlation analysis, analysis of variance and an introduction to non-parametric methods. Students also learn to use the R statistical environment and apply the methods to real-world data.",
    },
    "ANI-SSD": {
        "Annotation": "The course gives students a comprehensive understanding of game-design principles and teaches them to apply theoretical concepts in practice. It focuses on the design of game mechanics, systems and interactions, with an emphasis on balanced and engaging player experiences. Students encounter key areas of game design including level design, narrative structures, game economies, UX, multiplayer systems and testing. The course emphasizes player-behaviour analysis, iterative development and the creative design process.",
    },
    "ANI-TPA": {
        "Lecture syllabus": "The course has no lectures.",
        "Seminar syllabus": "Before or at the beginning of the semester, all students meet with the leaders of the individual projects, who may be faculty members or external partners. Students are assigned to final teams and receive an introductory briefing on project planning, management and monitoring, ideation, risk analysis and software support for teamwork. The briefing is intentionally concise because the teams are interdisciplinary and students develop the relevant specialist knowledge in other programme courses, such as Software Product Development (ANI-TSW) or User Interface Design (ANI-NUR). Teams then meet regularly with their project leader and, where appropriate, other domain experts to discuss interim results and define the next tasks and milestones. Students work independently between meetings using collaboration tools, especially the GitLab Premium environment provided by the faculty for project management and implementation.",
        "Literature": "To be added.",
    },
    "ANI-TPB": {
        "Annotation": "The course consists of regular and systematic work on the project selected in Team Project A. Students improve their collaboration skills in small interdisciplinary teams. Some students may use the project to identify and develop a topic for their future master's thesis, extending the project in the direction of their specialization.",
        "Lecture syllabus": "The course has no lectures.",
        "Seminar syllabus": "The course has no seminars.",
        "Literature": "To be added.",
    },
}


def clean(value: str) -> str:
    return " ".join(value.replace("\xa0", " ").split()).strip()


def read_czech_data() -> dict[str, dict]:
    source = CS_PATH.read_text(encoding="utf-8")
    if not source.startswith("/*") or PREFIX not in source:
        raise RuntimeError(f"Unexpected input format: {CS_PATH}")
    payload = source.split(PREFIX, 1)[1].rsplit(";", 1)[0]
    return json.loads(payload)


def paragraph_without_label(paragraph) -> str:
    clone = copy.deepcopy(paragraph)
    for label in clone.xpath("./b[1]"):
        label.drop_tree()
    return clean(clone.text_content())


def fetch_document(url: str):
    last_error = None
    for attempt in range(3):
        try:
            request = urllib.request.Request(
                url,
                headers={"User-Agent": "Grafit VCGD syllabus builder/1.0"},
            )
            with urllib.request.urlopen(request, timeout=30) as response:
                return html.fromstring(response.read())
        except Exception as error:
            last_error = error
            if attempt < 2:
                time.sleep(attempt + 1)
    raise last_error


def catalogue_links() -> dict[str, str]:
    document = fetch_document(CATALOGUE_INDEX)
    links: dict[str, str] = {}
    for anchor in document.xpath("//a[@href]"):
        code = clean(anchor.text_content())
        if code and code not in links:
            links[code] = urljoin(CATALOGUE_BASE, anchor.get("href"))
    return links


def translated_board_game_course(course: dict) -> tuple[str, dict]:
    return "ANI-DVD", {
        **course,
        "name": "Board Game Design",
        "sourceLabel": "VCGD source syllabus · English translation",
        "sections": [
            {
                "title": "Annotation",
                "type": "p",
                "content": "The course builds loosely on the bachelor's course BI-VHS and applies the acquired knowledge in practice. It focuses on the design and mechanical aspects of game design and uses them to develop and prepare an original board game. Students also learn principles typical of modern board games and practical aspects of production, publishing and release from industry professionals.",
            },
            {
                "title": "Lecture syllabus",
                "type": "ol",
                "content": [
                    "Introduction and modern board games",
                    "Design, prototyping, MVP and design sprints",
                    "Cooperative versus competitive games and zero-sum games",
                    "Party games: where does their appeal come from?",
                    "The 4Cs: creativity, critical thinking, communication and collaboration",
                    "Game-based learning versus gamification",
                    "Board games for ethical and social skills",
                    "Social board games, storytelling and logical deduction",
                    "Educational games versus education through play",
                    "Legacy games",
                    "Designing heavy economic and sandbox games",
                    "Presentation of the completed games",
                ],
            },
            {
                "title": "Seminar syllabus",
                "type": "ol",
                "content": [
                    "Hands-on prototyping and examples",
                    "Designing the first game and its prototype",
                    "Testing and evaluating the proposed prototypes",
                    "Further development of the first game and its prototype",
                    "Testing and evaluating the revised prototypes",
                    "Final presentation and assessment",
                ],
            },
            {
                "title": "Study objectives",
                "type": "p",
                "content": "Students apply game-design knowledge to the design and preparation of an original board game. They become familiar with principles used in modern board games and with the practical production, publishing and release process.",
            },
            {"title": "Study materials", "type": "p", "content": "To be added."},
            {"title": "Note", "type": "p", "content": "The course is taught in Czech."},
        ],
    }


def translated_thesis_course(course: dict) -> tuple[str, dict]:
    return "ANI-DIP", {
        **course,
        "name": "Master's Thesis",
        "url": "https://courses.fit.cvut.cz/SZZ",
        "sourceLabel": "VCGD source syllabus · English translation",
        "sections": [
            {
                "title": "Annotation",
                "type": "p",
                "content": "Teaching is based on individual consultations with the thesis supervisor and, where appropriate, other consultants. The 30 ECTS workload (approximately 900 hours) includes consultations, preparation of the theoretical and practical parts, writing, defence preparation and the defence before a committee.",
            },
            {"title": "Lecture syllabus", "type": "p", "content": "The course has no lectures."},
            {"title": "Seminar syllabus", "type": "p", "content": "The course has no seminars."},
            {
                "title": "Literature",
                "type": "p",
                "content": "Study materials are provided by the thesis supervisor.",
            },
            {
                "title": "Requirements",
                "type": "p",
                "content": "No additional requirements are specified in the source syllabus.",
            },
            {
                "title": "Note",
                "type": "p",
                "content": "Students must first have an approved master's thesis assignment. Further information and materials are available on the FIT Courses website.",
            },
        ],
    }


def parse_course(code: str, course: dict, links: dict[str, str]) -> tuple[str, dict]:
    if code == "ANI-DVD":
        return translated_board_game_course(course)
    if code == "ANI-DIP":
        return translated_thesis_course(course)

    catalogue_code = CODE_ALIASES.get(code, code)
    url = links.get(catalogue_code)
    if not url:
        raise RuntimeError(f"{code}: no course detail in the FIT CTU catalogue")

    document = fetch_document(url)

    blockquotes = document.xpath("//blockquote")
    if not blockquotes:
        raise RuntimeError(f"{code}: catalogue page has no course content")
    root = blockquotes[0]

    metadata_rows = root.xpath("./table[1]//tr")
    if not metadata_rows:
        raise RuntimeError(f"{code}: catalogue page has no metadata table")

    first_row = [clean(cell.text_content()) for cell in metadata_rows[0].xpath("./th|./td")]
    title = first_row[1] if len(first_row) > 1 else course.get("name", code)
    extent = first_row[-1] if len(first_row) > 3 else course.get("extent", "")
    second_row = [clean(cell.text_content()) for cell in metadata_rows[1].xpath("./th|./td")]
    ending = second_row[-1] if len(second_row) > 1 else course.get("ending", "")
    third_row = [clean(cell.text_content()) for cell in metadata_rows[2].xpath("./th|./td")]
    credits = third_row[3] if len(third_row) > 3 else course.get("credits", "")
    semester = third_row[-1] if len(third_row) > 1 else course.get("semester", "")

    sections = []
    for paragraph in root.xpath("./p"):
        labels = paragraph.xpath("./b[1]")
        if not labels:
            continue
        label = clean(labels[0].text_content()).rstrip(":")
        if label not in {
            "Annotation",
            "Lecture syllabus",
            "Seminar syllabus",
            "Literature",
            "Requirements",
            "Study objectives",
            "Learning outcomes",
        }:
            continue

        rows = paragraph.xpath(".//table[1]//tr")
        if rows:
            items = []
            for row in rows:
                cells = row.xpath("./td|./th")
                if cells:
                    item = clean(cells[-1].text_content())
                    if item:
                        items.append(item)
            if items:
                sections.append({"title": label, "type": "ol", "content": items})
                continue

        content = paragraph_without_label(paragraph)
        sections.append({"title": label, "type": "p", "content": content})

    if not sections:
        raise RuntimeError(f"{code}: no English syllabus sections found")

    translated = {
        **course,
        "code": code,
        "name": title,
        "extent": extent,
        "credits": credits,
        "semester": semester,
        "ending": ending,
        "url": url,
        "sourceLabel": "Official FIT CTU course catalogue",
        "sections": sections,
    }
    overrides = CATALOGUE_ENGLISH_OVERRIDES.get(code, {})
    if overrides:
        for section in translated["sections"]:
            if section["title"] in overrides:
                section["type"] = "p"
                section["content"] = overrides[section["title"]]
        translated["sourceLabel"] = (
            "Official FIT CTU course catalogue · English translation of Czech catalogue fields"
        )
    return code, translated


def main() -> None:
    source = read_czech_data()
    links = catalogue_links()
    output: dict[str, dict] = {}
    failures: list[str] = []

    completed_block = source["UEE"]
    output["UEE"] = {
        **completed_block,
        "name": "Environment Design in Unreal Engine",
        "extent": "four-day intensive block",
        "semester": "intensive block at the beginning of the examination period",
        "lecturers": ["Daniel Tripplet (Purdue University)"],
        "sourceLabel": "VCGD course records · completed intensive block",
        "sections": [
            {
                "title": "Annotation",
                "type": "p",
                "content": "An intensive practice-oriented course focused on creating interactive 3D environments in Unreal Engine. It combines work in Unreal Engine with basic preparation of 3D content in Blender and with the capture and use of 3D scans of physical objects.",
            },
            {
                "title": "Learning outcomes",
                "type": "ul",
                "content": [
                    "create and edit a simple interactive 3D environment in Unreal Engine",
                    "prepare basic 3D content in Blender for use in Unreal Engine",
                    "capture a 3D scan of an object and integrate the scanned object into an Unreal Engine environment",
                ],
            },
            {
                "title": "Intensive-block syllabus",
                "type": "ul",
                "content": [
                    "hands-on work in Unreal Engine to create an interactive environment",
                    "a basic workflow between Blender and Unreal Engine",
                    "a short practical course in 3D scanning objects",
                    "processing and using scanned objects in Unreal Engine",
                    "combining these techniques in the creation of a 3D environment",
                ],
            },
            {
                "title": "Teaching format",
                "type": "p",
                "content": "The course was delivered as a four-day intensive block at the beginning of the examination period. It was taught by Daniel Tripplet from Purdue University and carries 2 ECTS credits.",
            },
            {
                "title": "Next course run",
                "type": "p",
                "content": "A similar four-day intensive format is planned for the following academic year. The exact dates will be announced separately.",
            },
        ],
    }

    courses = [(code, course) for code, course in source.items() if code != "UEE"]
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {
            executor.submit(parse_course, code, course, links): code
            for code, course in courses
        }
        for future in as_completed(futures):
            code = futures[future]
            try:
                parsed_code, course = future.result()
                output[parsed_code] = course
                print(f"OK {parsed_code}: {len(course['sections'])} sections")
            except Exception as error:  # report every failed catalogue page together
                failures.append(f"{code}: {error}")

    if failures:
        raise RuntimeError("English catalogue import failed:\n" + "\n".join(sorted(failures)))

    for code, english_course in output.items():
        english_url = english_course.get("url", "")
        if english_url.startswith("https://bk.fit.cvut.cz/en/"):
            source[code]["url"] = english_url.replace(
                "https://bk.fit.cvut.cz/en/",
                "https://bk.fit.cvut.cz/cz/",
                1,
            )

    source["ANI-DVD"]["sourceLabel"] = "Sylabus z původní stránky VCGD"
    source["ANI-DIP"]["sourceLabel"] = "Sylabus z původní stránky VCGD"

    czech_ordered = {code: source[code] for code in sorted(source)}
    czech_payload = json.dumps(czech_ordered, ensure_ascii=False, indent=2)
    CS_PATH.write_text(
        "/* Generated from the legacy VCGD data and resolved against the official "
        "FIT CTU catalogue. Run both syllabus builders to rebuild. */\n"
        f"window.VCGD_SYLLABI = {czech_payload};\n",
        encoding="utf-8",
    )

    ordered = {code: output[code] for code in sorted(output)}
    payload = json.dumps(ordered, ensure_ascii=False, indent=2)
    EN_PATH.write_text(
        "/* Generated from the official English FIT CTU catalogue. "
        "Run tools/fetch-en-syllabi.py to rebuild. */\n"
        f"window.VCGD_SYLLABI = {payload};\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(czech_ordered)} Czech syllabi to {CS_PATH}")
    print(f"Wrote {len(ordered)} English syllabi to {EN_PATH}")


if __name__ == "__main__":
    main()
