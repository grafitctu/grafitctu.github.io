(() => {
  "use strict";

  const isCzech = document.documentElement.lang.toLowerCase().startsWith("cs");
  const copy = isCzech ? {
    extent: "Rozsah",
    ending: "Zakončení",
    people: "Lidé",
    guarantor: "Garant",
    lecturers: "Přednášející",
    instructors: "Cvičící",
    missingTitle: "Sylabus",
    missing: "Kompletní sylabus zatím není k dispozici.",
    action: "Zobrazit sylabus →"
  } : {
    extent: "Teaching extent",
    ending: "Completion",
    people: "People",
    guarantor: "Guarantor",
    lecturers: "Lecturers",
    instructors: "Instructors",
    missingTitle: "Syllabus",
    missing: "The complete syllabus is not available yet.",
    action: "View syllabus →"
  };

  const printCopy = isCzech ? {
    documentTitle: "VCGD - studijní plán a sylaby",
    kicker: "Magisterská specializace · Aplikovaná informatika",
    title: "Visual Computing and Game Design",
    planLabel: "Studijní plán",
    semesterStat: "4 semestry",
    creditStat: "120 ECTS celkem",
    courseStat: count => `${count} předmětů v přehledu`,
    legendTitle: "Kategorie předmětů",
    note: "V prvních dvou semestrech student volí alespoň jeden předmět z příslušného povinně volitelného bloku. Nejméně 12 ECTS zůstává pro volitelné předměty. Závazné podmínky určuje schválený studijní plán a informační systém ČVUT.",
    syllabiTitle: "Sylaby předmětů",
    syllabiIntro: "Kompletní sylaby jsou řazeny podle semestrů a pořadí ve studijním plánu. Údaje vycházejí z katalogu FIT ČVUT a z podkladů připravované specializace.",
    syllabusIndex: (index, total) => `Sylabus ${index} / ${total}`,
    source: "Zdroj",
    courseLink: "Katalog předmětu",
    categories: {
      program: { short: "P", label: "Povinné pro program" },
      specialization: { short: "S", label: "Povinné pro specializaci" },
      choice: { short: "PV", label: "Povinně volitelné" },
      optional: { short: "V", label: "Doporučené volitelné" }
    }
  } : {
    documentTitle: "VCGD - curriculum and syllabi",
    kicker: "Master's specialization · Applied Informatics",
    title: "Visual Computing and Game Design",
    planLabel: "Curriculum overview",
    semesterStat: "4 semesters",
    creditStat: "120 ECTS total",
    courseStat: count => `${count} courses in the overview`,
    legendTitle: "Course categories",
    note: "In each of the first two semesters, students choose at least one course from the respective required-elective block. At least 12 ECTS remain available for electives. Binding requirements are defined by the approved curriculum and the CTU information system.",
    syllabiTitle: "Course syllabi",
    syllabiIntro: "Complete syllabi follow the semester order used in the curriculum. The information is based on the FIT CTU catalogue and the source materials for the proposed specialization.",
    syllabusIndex: (index, total) => `Syllabus ${index} / ${total}`,
    source: "Source",
    courseLink: "Course catalogue",
    categories: {
      program: { short: "P", label: "Programme core" },
      specialization: { short: "S", label: "Specialization core" },
      choice: { short: "RE", label: "Required electives" },
      optional: { short: "E", label: "Recommended electives" }
    }
  };

  const syllabi = window.VCGD_SYLLABI || {};
  const filterButtons = Array.from(document.querySelectorAll("[data-semester-filter]"));
  const viewButtons = Array.from(document.querySelectorAll("[data-curriculum-view]"));
  const curriculumGrid = document.querySelector("[data-curriculum-grid]");
  const semesters = Array.from(document.querySelectorAll("[data-semester]"));
  const resultCount = document.querySelector("[data-results-count]");
  const dialog = document.querySelector("[data-course-dialog]");
  const dialogClose = dialog?.querySelector("[data-dialog-close]");
  const dialogFields = dialog ? {
    code: dialog.querySelector("[data-dialog-code]"),
    title: dialog.querySelector("[data-dialog-title]"),
    credits: dialog.querySelector("[data-dialog-credits]"),
    semester: dialog.querySelector("[data-dialog-semester]"),
    category: dialog.querySelector("[data-dialog-category]"),
    extent: dialog.querySelector("[data-dialog-extent]"),
    ending: dialog.querySelector("[data-dialog-ending]"),
    summary: dialog.querySelector("[data-dialog-summary]"),
    syllabus: dialog.querySelector("[data-dialog-syllabus]"),
    source: dialog.querySelector("[data-dialog-source]"),
    link: dialog.querySelector("[data-dialog-link]")
  } : null;

  let lastCourseTrigger = null;
  let printOriginalTitle = null;
  const printPreviewMode = new URLSearchParams(window.location.search).get("print") === "1";

  document.querySelectorAll(".course-action").forEach(action => {
    action.textContent = copy.action;
  });

  function updateCount() {
    if (!resultCount) return;
    const count = semesters
      .filter(semester => !semester.hidden)
      .reduce((sum, semester) => sum + semester.querySelectorAll("[data-course]").length, 0);
    const template = resultCount.dataset.countTemplate || "{count}";
    resultCount.textContent = template.replace("{count}", String(count));
  }

  function setSemesterFilter(value) {
    filterButtons.forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.semesterFilter === value));
    });

    semesters.forEach(semester => {
      semester.hidden = value !== "all" && semester.dataset.semester !== value;
    });

    updateCount();
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => setSemesterFilter(button.dataset.semesterFilter || "all"));
  });

  function setCurriculumView(value, persist = true) {
    if (!curriculumGrid || !["cards", "flow"].includes(value)) return;
    curriculumGrid.dataset.view = value;
    viewButtons.forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.curriculumView === value));
    });

    if (persist) {
      try {
        localStorage.setItem("vcgd-curriculum-view", value);
      } catch {
        // Some file:// previews block storage; the layout still changes for this page view.
      }
    }
  }

  viewButtons.forEach(button => {
    button.addEventListener("click", () => setCurriculumView(button.dataset.curriculumView || "cards"));
  });

  try {
    const savedView = localStorage.getItem("vcgd-curriculum-view");
    if (savedView) setCurriculumView(savedView, false);
  } catch {
    // Keep the default card view when local storage is unavailable.
  }

  function createTextSection(title, text) {
    const section = document.createElement("section");
    section.className = "syllabus-section";
    const heading = document.createElement("h3");
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = text || "";
    section.append(heading, paragraph);
    return section;
  }

  function createPeopleSection(details) {
    const rows = [];
    if (details.guarantor) rows.push([copy.guarantor, details.guarantor]);
    if (Array.isArray(details.lecturers) && details.lecturers.length) {
      rows.push([copy.lecturers, details.lecturers.join(", ")]);
    }
    if (Array.isArray(details.instructors) && details.instructors.length) {
      rows.push([copy.instructors, details.instructors.join(", ")]);
    }
    if (!rows.length) return null;

    const section = document.createElement("section");
    section.className = "syllabus-section syllabus-people";
    const heading = document.createElement("h3");
    heading.textContent = copy.people;
    const list = document.createElement("dl");
    rows.forEach(([label, value]) => {
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      description.textContent = value;
      list.append(term, description);
    });
    section.append(heading, list);
    return section;
  }

  function createSyllabusSection(sectionData) {
    const section = document.createElement("section");
    section.className = "syllabus-section";
    const heading = document.createElement("h3");
    heading.textContent = sectionData.title || copy.missingTitle;
    section.appendChild(heading);

    if ((sectionData.type === "ol" || sectionData.type === "ul") && Array.isArray(sectionData.content)) {
      const list = document.createElement(sectionData.type);
      sectionData.content.forEach(item => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        list.appendChild(listItem);
      });
      section.appendChild(list);
    } else {
      const paragraph = document.createElement("p");
      paragraph.textContent = sectionData.content || "";
      section.appendChild(paragraph);
    }

    return section;
  }

  function renderSyllabus(details) {
    if (!dialogFields) return;
    dialogFields.syllabus.replaceChildren();

    if (!details) {
      dialogFields.syllabus.appendChild(createTextSection(copy.missingTitle, copy.missing));
      return;
    }

    const people = createPeopleSection(details);
    if (people) dialogFields.syllabus.appendChild(people);
    (details.sections || []).forEach(section => {
      dialogFields.syllabus.appendChild(createSyllabusSection(section));
    });
  }

  function setOptionalMeta(element, label, value) {
    if (!element) return;
    element.textContent = value ? `${label}: ${value}` : "";
    element.hidden = !value;
  }

  function openCourseDialog(trigger) {
    if (!dialog || !dialogFields) return;
    lastCourseTrigger = trigger;

    const code = trigger.dataset.code || "";
    const details = syllabi[code];
    dialogFields.code.textContent = code;
    dialogFields.title.textContent = trigger.dataset.title || details?.name || "";
    dialogFields.credits.textContent = trigger.dataset.credits || "";
    dialogFields.semester.textContent = trigger.dataset.semesterLabel || "";
    dialogFields.category.textContent = trigger.dataset.categoryLabel || "";
    dialogFields.summary.textContent = trigger.dataset.summary || "";
    setOptionalMeta(dialogFields.extent, copy.extent, details?.extent);
    setOptionalMeta(dialogFields.ending, copy.ending, details?.ending);
    renderSyllabus(details);

    dialogFields.source.textContent = details?.sourceLabel || "";
    dialogFields.source.classList.toggle("is-planned", Boolean(details?.planned));

    const url = details?.url || trigger.dataset.url || "";
    if (url) {
      dialogFields.link.href = url;
      dialogFields.link.hidden = false;
    } else {
      dialogFields.link.removeAttribute("href");
      dialogFields.link.hidden = true;
    }

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  document.querySelectorAll("[data-course]").forEach(course => {
    course.addEventListener("click", () => openCourseDialog(course));
  });

  function closeCourseDialog() {
    if (!dialog) return;
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      lastCourseTrigger?.focus();
    }
  }

  dialogClose?.addEventListener("click", closeCourseDialog);

  dialog?.addEventListener("click", event => {
    if (event.target === dialog) closeCourseDialog();
  });

  dialog?.addEventListener("close", () => {
    lastCourseTrigger?.focus();
  });

  function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  }

  function getCourseCategory(course) {
    return ["program", "specialization", "choice", "optional"]
      .find(category => course.classList.contains(`category-${category}`)) || "optional";
  }

  function buildPrintPlan(courses) {
    const page = makeElement("section", "print-plan-page");
    const header = makeElement("header", "print-plan-header");
    const heading = makeElement("div", "print-plan-heading");
    heading.append(
      makeElement("p", "print-kicker", printCopy.kicker),
      makeElement("h1", "", printCopy.title),
      makeElement("p", "print-plan-label", printCopy.planLabel)
    );

    const stats = makeElement("div", "print-plan-stats");
    [printCopy.semesterStat, printCopy.creditStat, printCopy.courseStat(courses.length)].forEach((value, index) => {
      const stat = makeElement("div", "print-plan-stat");
      const parts = value.split(" ");
      stat.append(
        makeElement("strong", "", parts.shift()),
        makeElement("span", "", parts.join(" "))
      );
      if (index === 1) stat.classList.add("is-credits");
      stats.appendChild(stat);
    });
    header.append(heading, stats);

    const legend = makeElement("div", "print-plan-legend");
    legend.appendChild(makeElement("strong", "", printCopy.legendTitle));
    Object.entries(printCopy.categories).forEach(([key, value]) => {
      const item = makeElement("span", `print-legend-item print-category-${key}`);
      item.append(
        makeElement("b", "", value.short),
        makeElement("span", "", value.label)
      );
      legend.appendChild(item);
    });

    const grid = makeElement("div", "print-semester-grid");
    semesters.forEach(semester => {
      const column = makeElement("section", "print-semester");
      const semesterHeader = makeElement("header", "print-semester-header");
      semesterHeader.append(
        makeElement("span", "", semester.querySelector(".semester-index")?.textContent || ""),
        makeElement("h2", "", semester.querySelector("h3")?.textContent || "")
      );

      const list = makeElement("ol", "print-plan-courses");
      semester.querySelectorAll("[data-course]").forEach(course => {
        const category = getCourseCategory(course);
        const item = makeElement("li", `print-plan-course print-category-${category}`);
        const body = makeElement("span", "print-plan-course-body");
        body.append(
          makeElement("strong", "", course.dataset.code || ""),
          makeElement("span", "", course.dataset.title || "")
        );
        item.append(
          makeElement("b", "print-category-badge", printCopy.categories[category].short),
          body,
          makeElement("span", "print-plan-credits", course.dataset.credits || "")
        );
        list.appendChild(item);
      });
      column.append(semesterHeader, list);
      grid.appendChild(column);
    });

    const footer = makeElement("footer", "print-plan-footer");
    footer.append(
      makeElement("p", "", printCopy.note),
      makeElement("strong", "", "grafitctu.github.io/vcgd/")
    );
    page.append(header, legend, grid, footer);
    return page;
  }

  function buildPrintPeople(details) {
    const rows = [];
    if (details?.guarantor) rows.push([copy.guarantor, details.guarantor]);
    if (Array.isArray(details?.lecturers) && details.lecturers.length) {
      rows.push([copy.lecturers, details.lecturers.join(", ")]);
    }
    if (Array.isArray(details?.instructors) && details.instructors.length) {
      rows.push([copy.instructors, details.instructors.join(", ")]);
    }
    if (!rows.length) return null;

    const section = makeElement("section", "print-syllabus-section print-people");
    section.appendChild(makeElement("h3", "", copy.people));
    const list = makeElement("dl", "");
    rows.forEach(([label, value]) => {
      list.append(
        makeElement("dt", "", label),
        makeElement("dd", "", value)
      );
    });
    section.appendChild(list);
    return section;
  }

  function buildPrintSyllabusSection(sectionData) {
    const section = makeElement("section", "print-syllabus-section");
    section.appendChild(makeElement("h3", "", sectionData.title || copy.missingTitle));
    if ((sectionData.type === "ol" || sectionData.type === "ul") && Array.isArray(sectionData.content)) {
      const list = makeElement(sectionData.type, "");
      sectionData.content.forEach(item => list.appendChild(makeElement("li", "", item)));
      section.appendChild(list);
    } else {
      section.appendChild(makeElement("p", "", sectionData.content || ""));
    }
    return section;
  }

  function buildPrintCourse(course, index, total) {
    const code = course.dataset.code || "";
    const details = syllabi[code];
    const category = getCourseCategory(course);
    const article = makeElement("article", `print-course print-category-${category}`);
    const runningHeader = makeElement("div", "print-course-running");
    runningHeader.append(
      makeElement("strong", "", "VCGD · FIT ČVUT"),
      makeElement("span", "", printCopy.syllabusIndex(index + 1, total))
    );

    const header = makeElement("header", "print-course-header");
    const titleBlock = makeElement("div", "");
    titleBlock.append(
      makeElement("p", "print-course-code", code),
      makeElement("h2", "", course.dataset.title || details?.name || "")
    );
    const badge = makeElement("div", "print-course-category");
    badge.append(
      makeElement("b", "", printCopy.categories[category].short),
      makeElement("span", "", printCopy.categories[category].label)
    );
    header.append(titleBlock, badge);

    const meta = makeElement("div", "print-course-meta");
    [
      course.dataset.credits,
      course.dataset.semesterLabel,
      details?.extent ? `${copy.extent}: ${details.extent}` : "",
      details?.ending ? `${copy.ending}: ${details.ending}` : ""
    ].filter(Boolean).forEach(value => meta.appendChild(makeElement("span", "", value)));

    article.append(
      runningHeader,
      header,
      meta,
      makeElement("p", "print-course-summary", course.dataset.summary || "")
    );

    const columns = makeElement("div", "print-course-columns");
    const people = buildPrintPeople(details);
    if (people) columns.appendChild(people);
    if (details?.sections?.length) {
      details.sections.forEach(section => columns.appendChild(buildPrintSyllabusSection(section)));
    } else {
      columns.appendChild(buildPrintSyllabusSection({ title: copy.missingTitle, type: "p", content: copy.missing }));
    }
    article.appendChild(columns);

    const url = details?.url || course.dataset.url || "";
    const source = makeElement("footer", "print-course-source");
    source.appendChild(makeElement("span", "", `${printCopy.source}: ${details?.sourceLabel || "FIT ČVUT"}`));
    if (url) {
      const link = makeElement("a", "", `${printCopy.courseLink}: ${url}`);
      link.href = url;
      source.appendChild(link);
    }
    article.appendChild(source);
    return article;
  }

  function preparePrintDocument() {
    document.querySelector("[data-print-document]")?.remove();
    const courses = Array.from(document.querySelectorAll("[data-course]"));
    const printDocument = makeElement("div", "print-document");
    printDocument.dataset.printDocument = "";
    printDocument.appendChild(buildPrintPlan(courses));

    const syllabiSection = makeElement("section", "print-syllabi");
    const heading = makeElement("header", "print-syllabi-heading");
    heading.append(
      makeElement("p", "print-kicker", printCopy.title),
      makeElement("h1", "", printCopy.syllabiTitle),
      makeElement("p", "", printCopy.syllabiIntro)
    );
    syllabiSection.appendChild(heading);
    courses.forEach((course, index) => {
      syllabiSection.appendChild(buildPrintCourse(course, index, courses.length));
    });
    printDocument.appendChild(syllabiSection);
    document.body.appendChild(printDocument);
    document.body.classList.add("print-ready");
  }

  function setPrintTitle() {
    if (printOriginalTitle === null) printOriginalTitle = document.title;
    document.title = printCopy.documentTitle;
  }

  function cleanupPrintDocument() {
    if (printPreviewMode) return;
    document.querySelector("[data-print-document]")?.remove();
    document.body.classList.remove("print-ready");
    if (printOriginalTitle !== null) {
      document.title = printOriginalTitle;
      printOriginalTitle = null;
    }
  }

  document.querySelectorAll("[data-print]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      setPrintTitle();
      preparePrintDocument();
      requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
    });
  });

  window.addEventListener("beforeprint", () => {
    setPrintTitle();
    if (!document.querySelector("[data-print-document]")) preparePrintDocument();
  });
  window.addEventListener("afterprint", cleanupPrintDocument);

  updateCount();

  if (printPreviewMode) {
    setPrintTitle();
    preparePrintDocument();
  }
})();
