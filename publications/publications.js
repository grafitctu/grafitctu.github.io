(function () {
  "use strict";

  const catalogue = window.GRAFIT_PUBLICATIONS;
  const language = document.documentElement.lang === "en" ? "en" : "cs";

  if (!catalogue || !Array.isArray(catalogue.publications)) {
    return;
  }

  const labels = {
    cs: {
      allRecords: "Všechny záznamy",
      publication: (count) => count === 1 ? "publikace" : count < 5 ? "publikace" : "publikací",
      record: (count) => count === 1 ? "záznam" : count < 5 ? "záznamy" : "záznamů",
      memberCount: (count) => `${count} ${count === 1 ? "publikace" : count < 5 ? "publikace" : "publikací"}`,
      open: "Otevřít publikaci",
      profile: "Profil člena",
      filteredBy: "Filtr",
      search: "hledání",
      author: "autor",
      type: "typ",
      year: "rok",
      category: {
        journal: "Článek v časopise",
        conference: "Konferenční příspěvek",
        chapter: "Kapitola",
        other: "Publikace"
      }
    },
    en: {
      allRecords: "All records",
      publication: (count) => count === 1 ? "publication" : "publications",
      record: (count) => count === 1 ? "record" : "records",
      memberCount: (count) => `${count} ${count === 1 ? "publication" : "publications"}`,
      open: "Open publication",
      profile: "Member profile",
      filteredBy: "Filter",
      search: "search",
      author: "author",
      type: "type",
      year: "year",
      category: {
        journal: "Journal article",
        conference: "Conference paper",
        chapter: "Book chapter",
        other: "Publication"
      }
    }
  };

  const text = labels[language];
  const colours = {
    jch: "#58e6f5",
    jk: "#75c9ff",
    jm: "#7f9cff",
    pp: "#d876ff",
    rr: "#f1c75b",
    tn: "#8be0b0"
  };
  const monograms = {
    jch: "JCh",
    jk: "JK",
    jm: "JM",
    pp: "PP",
    rr: "RR",
    tn: "TN"
  };

  const filters = document.querySelector("[data-filters]");
  const searchInput = document.querySelector("[data-search]");
  const authorFilter = document.querySelector("[data-author-filter]");
  const typeFilter = document.querySelector("[data-type-filter]");
  const yearFilter = document.querySelector("[data-year-filter]");
  const list = document.querySelector("[data-publication-list]");
  const empty = document.querySelector("[data-empty]");
  const resultsCount = document.querySelector("[data-results-count]");
  const resultsLabel = document.querySelector("[data-results-label]");
  const activeFilter = document.querySelector("[data-active-filter]");
  const authorGrid = document.querySelector("[data-author-grid]");

  function localised(value) {
    if (value && typeof value === "object") {
      return value[language] || value.cs || value.en || "";
    }
    return value || "";
  }

  function normalise(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase(language);
  }

  function memberName(member) {
    return catalogue.members[member] ? catalogue.members[member].name : member;
  }

  function memberUrl(member) {
    if (language === "en" && member === "tn") {
      return "../../members/tn/";
    }
    return language === "en"
      ? `../../members/${member}/en/`
      : `../members/${member}/`;
  }

  function setAuthorColour(element, member) {
    element.style.setProperty("--author-color", colours[member] || colours.jch);
  }

  function countByMember(member) {
    return catalogue.publications.filter((publication) => publication.member === member).length;
  }

  function initialiseSummary() {
    const years = catalogue.publications.map((publication) => Number(publication.year)).filter(Number.isFinite);
    const oldest = Math.min(...years);
    const newest = Math.max(...years);
    document.querySelectorAll("[data-total-publications]").forEach((element) => {
      element.textContent = String(catalogue.publications.length);
    });
    document.querySelectorAll("[data-total-authors]").forEach((element) => {
      element.textContent = String(Object.keys(catalogue.members).length);
    });
    document.querySelectorAll("[data-year-span]").forEach((element) => {
      element.textContent = String(newest - oldest + 1);
    });

    const date = new Date(`${catalogue.updated}T12:00:00`);
    const formatted = new Intl.DateTimeFormat(language === "en" ? "en-GB" : "cs-CZ", {
      day: "numeric",
      month: language === "en" ? "long" : "numeric",
      year: "numeric"
    }).format(date);
    document.querySelectorAll("[data-updated-date]").forEach((element) => {
      element.textContent = formatted;
    });
  }

  function populateFilters() {
    Object.keys(catalogue.members).forEach((member) => {
      const option = document.createElement("option");
      option.value = member;
      option.textContent = `${memberName(member)} · ${countByMember(member)}`;
      authorFilter.appendChild(option);
    });

    const years = [...new Set(catalogue.publications.map((publication) => publication.year))]
      .sort((a, b) => Number(b) - Number(a));
    years.forEach((year) => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });
  }

  function createAuthorCard(member) {
    const count = countByMember(member);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "author-card";
    button.dataset.authorCard = member;
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `${memberName(member)}: ${text.memberCount(count)}`);
    setAuthorColour(button, member);

    const monogram = document.createElement("span");
    monogram.className = "author-monogram";
    monogram.textContent = monograms[member] || member.toUpperCase();

    const name = document.createElement("strong");
    name.textContent = memberName(member);

    const total = document.createElement("span");
    total.textContent = text.memberCount(count);

    button.append(monogram, name, total);
    button.addEventListener("click", () => {
      authorFilter.value = authorFilter.value === member ? "" : member;
      render();
      document.querySelector("#catalogue").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return button;
  }

  function renderAuthors() {
    const fragment = document.createDocumentFragment();
    Object.keys(catalogue.members).forEach((member) => fragment.appendChild(createAuthorCard(member)));
    authorGrid.replaceChildren(fragment);
  }

  function restoreState() {
    const params = new URLSearchParams(window.location.search);
    searchInput.value = params.get("q") || "";
    authorFilter.value = params.get("author") || "";
    typeFilter.value = params.get("type") || "";
    yearFilter.value = params.get("year") || "";
  }

  function updateUrl() {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
    if (authorFilter.value) params.set("author", authorFilter.value);
    if (typeFilter.value) params.set("type", typeFilter.value);
    if (yearFilter.value) params.set("year", yearFilter.value);
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }

  function filteredPublications() {
    const query = normalise(searchInput.value.trim());
    return catalogue.publications.filter((publication) => {
      if (authorFilter.value && publication.member !== authorFilter.value) return false;
      if (typeFilter.value && publication.category !== typeFilter.value) return false;
      if (yearFilter.value && publication.year !== yearFilter.value) return false;
      if (!query) return true;
      const haystack = normalise([
        localised(publication.title),
        localised(publication.meta),
        localised(publication.type),
        memberName(publication.member),
        publication.year
      ].join(" "));
      return haystack.includes(query);
    });
  }

  function createPublicationItem(publication) {
    const article = document.createElement("article");
    article.className = "publication-item";

    const body = document.createElement("div");
    const kicker = document.createElement("div");
    kicker.className = "publication-kicker";

    const type = document.createElement("span");
    type.className = "publication-type";
    type.textContent = text.category[publication.category] || localised(publication.type);

    const member = document.createElement("a");
    member.className = "publication-member";
    member.href = memberUrl(publication.member);
    member.textContent = memberName(publication.member);
    member.setAttribute("aria-label", `${text.profile}: ${memberName(publication.member)}`);
    setAuthorColour(member, publication.member);
    kicker.append(type, member);

    const title = document.createElement("h4");
    title.className = "publication-title";
    const titleLink = document.createElement("a");
    titleLink.href = publication.url;
    titleLink.target = "_blank";
    titleLink.rel = "noopener";
    titleLink.textContent = localised(publication.title);
    title.appendChild(titleLink);

    const citation = document.createElement("p");
    citation.className = "publication-citation";
    citation.textContent = localised(publication.meta);
    body.append(kicker, title, citation);

    const recordLink = document.createElement("a");
    recordLink.className = "record-link";
    recordLink.href = publication.url;
    recordLink.target = "_blank";
    recordLink.rel = "noopener";
    recordLink.textContent = "↗";
    recordLink.setAttribute("aria-label", `${text.open}: ${localised(publication.title)}`);

    article.append(body, recordLink);
    return article;
  }

  function createYearGroup(year, publications) {
    const section = document.createElement("section");
    section.className = "year-group";
    section.setAttribute("aria-labelledby", `year-${year}`);

    const heading = document.createElement("h3");
    heading.className = "year-heading";
    heading.id = `year-${year}`;
    const yearText = document.createElement("strong");
    yearText.textContent = year;
    const count = document.createElement("span");
    count.textContent = `${publications.length} ${text.record(publications.length)}`;
    heading.append(yearText, count);

    const yearList = document.createElement("div");
    yearList.className = "publication-list";
    publications.forEach((publication) => yearList.appendChild(createPublicationItem(publication)));
    section.append(heading, yearList);
    return section;
  }

  function updateActiveFilters() {
    const active = [];
    if (searchInput.value.trim()) active.push(`${text.search}: “${searchInput.value.trim()}”`);
    if (authorFilter.value) active.push(`${text.author}: ${memberName(authorFilter.value)}`);
    if (typeFilter.value) active.push(`${text.type}: ${typeFilter.selectedOptions[0].textContent}`);
    if (yearFilter.value) active.push(`${text.year}: ${yearFilter.value}`);
    activeFilter.textContent = active.length ? `${text.filteredBy}: ${active.join(" · ")}` : text.allRecords;

    document.querySelectorAll("[data-author-card]").forEach((card) => {
      card.setAttribute("aria-pressed", String(card.dataset.authorCard === authorFilter.value));
    });
  }

  function render() {
    const publications = filteredPublications();
    const groups = new Map();
    publications.forEach((publication) => {
      if (!groups.has(publication.year)) groups.set(publication.year, []);
      groups.get(publication.year).push(publication);
    });

    const fragment = document.createDocumentFragment();
    groups.forEach((records, year) => fragment.appendChild(createYearGroup(year, records)));
    list.replaceChildren(fragment);
    empty.hidden = publications.length !== 0;
    resultsCount.textContent = String(publications.length);
    resultsLabel.textContent = text.publication(publications.length);
    updateActiveFilters();
    updateUrl();
  }

  initialiseSummary();
  populateFilters();
  renderAuthors();
  restoreState();
  render();

  filters.addEventListener("input", render);
  filters.addEventListener("change", render);
  filters.addEventListener("reset", () => {
    window.setTimeout(render, 0);
  });
}());
