(function () {
  "use strict";

  const allRecords = window.GRAFIT_MEMBER_RECORDS || {};
  const language = document.documentElement.lang === "en" ? "en" : "cs";

  const labels = {
    cs: {
      archive: {
        publications: "Starší publikace",
        master: "Starší diplomové práce",
        bachelor: "Starší bakalářské práce"
      },
      itemCount: (count) => `${count} ${count === 1 ? "položka" : count < 5 ? "položky" : "položek"}`,
      thesisCount: (count) => `${count} ${count === 1 ? "práce" : count < 5 ? "práce" : "prací"}`,
      open: "Otevřít záznam",
      empty: "V evidenci nejsou žádné položky."
    },
    en: {
      archive: {
        publications: "Earlier publications",
        master: "Earlier master's theses",
        bachelor: "Earlier bachelor's theses"
      },
      itemCount: (count) => `${count} ${count === 1 ? "item" : "items"}`,
      thesisCount: (count) => `${count} ${count === 1 ? "thesis" : "theses"}`,
      open: "Open record",
      empty: "No records are listed."
    }
  };

  function localised(value) {
    if (value && typeof value === "object") {
      return value[language] || value.cs || value.en || "";
    }
    return value || "";
  }

  function thesisKind(type) {
    const normalised = localised(type).toLowerCase();
    if (normalised.includes("diplom") || normalised.includes("master")) {
      return "master";
    }
    return "bachelor";
  }

  function typeAbbreviation(record, kind) {
    if (kind === "publications") {
      const value = localised(record.type).toLowerCase();
      if (value.includes("článek") || value.includes("journal")) return language === "cs" ? "článek" : "paper";
      if (value.includes("kapitola") || value.includes("chapter")) return language === "cs" ? "kapitola" : "chapter";
      return language === "cs" ? "publikace" : "publication";
    }
    return thesisKind(record.type) === "master"
      ? (language === "cs" ? "DP" : "MSc")
      : (language === "cs" ? "BP" : "BSc");
  }

  function createRecordLink(record, kind) {
    const anchor = document.createElement("a");
    anchor.className = "work-item";
    anchor.href = record.url;
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.setAttribute("aria-label", `${labels[language].open}: ${localised(record.title)}`);

    const year = document.createElement("span");
    year.className = "work-year";
    year.textContent = `${record.year || "—"} · ${typeAbbreviation(record, kind)}`;

    const title = document.createElement("span");
    title.className = "work-title";
    const strong = document.createElement("strong");
    strong.textContent = localised(record.title);
    const meta = document.createElement("span");
    meta.textContent = kind === "publications" ? localised(record.meta) : record.author;
    title.append(strong, meta);

    const arrow = document.createElement("span");
    arrow.className = "work-arrow";
    arrow.textContent = "↗";
    arrow.setAttribute("aria-hidden", "true");

    anchor.append(year, title, arrow);
    return anchor;
  }

  function createList(records, kind) {
    const list = document.createElement("div");
    list.className = "selected-work";
    records.forEach((record) => list.appendChild(createRecordLink(record, kind)));
    return list;
  }

  function yearRange(records) {
    const years = records
      .map((record) => Number.parseInt(record.year, 10))
      .filter(Number.isFinite);
    if (!years.length) return "";
    const newest = Math.max(...years);
    const oldest = Math.min(...years);
    return newest === oldest ? String(newest) : `${newest}–${oldest}`;
  }

  function renderCatalog(container, records, kind) {
    const visibleCount = Math.max(0, Number.parseInt(container.dataset.visible || "8", 10));
    const visible = records.slice(0, visibleCount);
    const archived = records.slice(visibleCount);
    const catalog = document.createElement("div");
    catalog.className = "catalog";

    if (visible.length) {
      catalog.appendChild(createList(visible, kind));
    }

    if (archived.length) {
      const details = document.createElement("details");
      details.className = "catalog-archive";
      const summary = document.createElement("summary");
      const text = document.createElement("span");
      const title = document.createElement("span");
      title.className = "catalog-summary-title";
      title.textContent = labels[language].archive[kind];
      const meta = document.createElement("span");
      meta.className = "catalog-summary-meta";
      const countText = kind === "publications"
        ? labels[language].itemCount(archived.length)
        : labels[language].thesisCount(archived.length);
      const range = yearRange(archived);
      meta.textContent = range ? `${countText} · ${range}` : countText;
      text.append(title, meta);
      summary.appendChild(text);
      details.append(summary, createList(archived, kind));
      catalog.appendChild(details);
    }

    container.replaceChildren(catalog);
  }

  function updateCount(member, kind, count) {
    document.querySelectorAll(`[data-record-count="${member}:${kind}"]`).forEach((element) => {
      element.textContent = String(count);
    });
  }

  document.querySelectorAll("[data-member-records]").forEach((container) => {
    const member = container.dataset.memberRecords;
    const kind = container.dataset.recordKind;
    const memberData = allRecords[member] || {};
    let records = Array.isArray(memberData[kind]) ? memberData[kind] : [];

    if (kind === "theses") {
      const thesisType = container.dataset.thesisType;
      records = records.filter((record) => thesisKind(record.type) === thesisType);
      updateCount(member, thesisType, records.length);
      renderCatalog(container, records, thesisType);
      return;
    }

    updateCount(member, kind, records.length);
    if (records.length) {
      renderCatalog(container, records, kind);
    }
    else {
      const empty = document.createElement("p");
      empty.className = "records-empty";
      empty.textContent = labels[language].empty;
      container.replaceChildren(empty);
    }
  });
}());

