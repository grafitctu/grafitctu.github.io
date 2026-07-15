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

  document.querySelectorAll("[data-print]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      window.print();
    });
  });

  updateCount();
})();
