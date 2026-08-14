(function () {
  "use strict";
  const data = window.GRAFIT_EVENINGS || {events: []};
  const lang = document.body.dataset.lang === "en" ? "en" : "cs";
  const events = data.events || [];
  const t = (value) => value && typeof value === "object" && !Array.isArray(value) ? (value[lang] || value.cs || value.en || "") : (value || "");
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const fmt = (event) => t(event.dateLabel) || event.date || (lang === "en" ? "Details to be added" : "Údaje doplníme");
  const detailUrl = (id) => (lang === "en" ? "./event.html" : "event.html") + "?id=" + encodeURIComponent(id);

  function card(event) {
    const searchText = (t(event.title) + " " + t(event.summary) + " " + t(event.lecturer) + " " + ((event.tags && event.tags[lang]) || []).join(" ")).toLowerCase();
    return `<article class="card" data-event data-search-text="${esc(searchText)}"><img loading="lazy" src="${esc(event.image)}" alt="${esc(t(event.title))}"><div class="card-body"><div class="status">${esc(t(event.notice))}</div><h3>${esc(t(event.title))}</h3><div class="meta"><span>${esc(fmt(event))}</span>${event.time ? `<span>${esc(event.time)}</span>` : ""}</div><p>${esc(t(event.summary))}</p><div class="tags">${((event.tags && event.tags[lang]) || []).slice(0,4).map((tag) => `<span class="tag">${esc(tag)}</span>`).join("")}</div><p class="card-action"><a class="card-link" href="${detailUrl(event.id)}">${lang === "en" ? "Read the event story →" : "Číst o večeru →"}</a></p></div></article>`;
  }

  function renderOverview() {
    const seriesEvents = events.filter((event) => event.series !== "course");
    const sorted = seriesEvents.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const archive = sorted.filter((event) => event.status === "archive");
    const upcoming = sorted.filter((event) => event.status === "upcoming");
    const feature = document.querySelector("[data-feature-event]");
    if (feature && archive[0]) {
      const event = archive[0];
      feature.innerHTML = `<img src="${esc(event.image)}" alt="${esc(t(event.title))}"><div class="card-body"><div class="status">${esc(t(event.notice))}</div><h2>${esc(t(event.title))}</h2><div class="meta"><span>${esc(fmt(event))}</span>${event.time ? `<span>${esc(event.time)}</span>` : ""}<span>${esc(event.venue)}</span></div><p>${esc(t(event.lead))}</p><a class="card-link" href="${detailUrl(event.id)}">${lang === "en" ? "Open featured evening →" : "Otevřít hlavní večer →"}</a></div>`;
    }
    const archiveGrid = document.querySelector("[data-archive-grid]");
    if (archiveGrid) archiveGrid.innerHTML = archive.map(card).join("");
    const upcomingGrid = document.querySelector("[data-upcoming-grid]");
    const empty = document.querySelector("[data-upcoming-empty]");
    if (upcomingGrid) upcomingGrid.innerHTML = upcoming.map(card).join("");
    if (empty) empty.style.display = upcoming.length ? "none" : "block";
    const count = document.querySelector("[data-archive-count]");
    if (count) count.textContent = archive.length;
    const stat = document.querySelector("[data-stat-events]");
    if (stat) stat.textContent = seriesEvents.length;

    const allTags = [];
    archive.forEach((event) => ((event.tags && event.tags[lang]) || []).forEach((tag) => { if (!allTags.includes(tag)) allTags.push(tag); }));
    const tagList = document.querySelector("[data-tag-list]");
    if (tagList) tagList.innerHTML = `<button class="tag active" data-tag="">${lang === "en" ? "All" : "Vše"}</button>` + allTags.sort().map((tag) => `<button class="tag" data-tag="${esc(tag)}">${esc(tag)}</button>`).join("");
    const search = document.querySelector("[data-search]");
    let active = "";
    function filter() {
      const query = (search && search.value || "").toLowerCase();
      document.querySelectorAll("[data-archive-grid] [data-event]").forEach((node) => {
        const matches = (!query || node.dataset.searchText.includes(query)) && (!active || node.dataset.searchText.includes(active.toLowerCase()));
        node.hidden = !matches;
      });
      const reset = document.querySelector("[data-reset]");
      if (reset) reset.hidden = !query && !active;
    }
    if (search) search.addEventListener("input", filter);
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-tag]");
      if (!button) return;
      active = button.dataset.tag;
      document.querySelectorAll("[data-tag]").forEach((item) => item.classList.toggle("active", item === button));
      filter();
    });
    const reset = document.querySelector("[data-reset]");
    if (reset) reset.addEventListener("click", () => { if (search) search.value = ""; active = ""; document.querySelectorAll("[data-tag]").forEach((item, index) => item.classList.toggle("active", index === 0)); filter(); });
  }

  function renderDetail() {
    const id = new URLSearchParams(location.search).get("id");
    const event = events.find((item) => item.id === id);
    const notFound = document.querySelector("[data-not-found]");
    if (!event) { if (notFound) notFound.hidden = false; return; }
    document.title = t(event.title) + (event.series === "course" ? " · GRAFIT" : " · Grafické večery");
    const set = (selector, value) => { const node = document.querySelector(selector); if (node) node.innerHTML = value; };
    set("[data-detail-type]", esc(t(event.type))); set("[data-detail-status]", esc(t(event.notice))); set("[data-detail-title]", esc(t(event.title))); set("[data-detail-lead]", esc(t(event.lead)));
    const image = document.querySelector("[data-detail-image]"); if (image) { image.src = event.image; image.alt = t(event.title); }
    [["date",fmt(event)],["time",event.time],["venue",event.venue],["lecturer",t(event.lecturer)],["language",t(event.language)],["credits",event.credits]].forEach(([name,value]) => { const node = document.querySelector(`[data-detail-${name}]`); if (node) { node.textContent = value || ""; node.parentElement.style.display = value ? "" : "none"; } });
    const tags = document.querySelector("[data-detail-tags]"); if (tags) tags.innerHTML = ((event.tags && event.tags[lang]) || []).map((tag) => `<span class="tag">${esc(tag)}</span>`).join("");
    const sections = document.querySelector("[data-detail-sections]"); if (sections) sections.innerHTML = (event.sections || []).map((section) => `<section class="detail-section"><div class="eyebrow">${esc(section.icon || "")} · ${esc(t(section.eyebrow))}</div><h2>${esc(t(section.title))}</h2>${((section.paragraphs && section.paragraphs[lang]) || []).map((paragraph) => `<p>${paragraph}</p>`).join("")}${section.cards && section.cards.length ? `<div class="detail-cards">${section.cards.map((item) => `<div class="detail-card"><h3>${esc(t(item.title))}</h3><p>${esc(t(item.text))}</p></div>`).join("")}</div>` : ""}</section>`).join("");
    const external = document.querySelector("[data-external]"); if (external) { if (event.externalUrl) { external.href = event.externalUrl; external.hidden = false; } else external.hidden = true; }
    const languageLink = document.querySelector("[data-language-link]"); if (languageLink) languageLink.href = (lang === "en" ? "../event.html" : "./en/event.html") + "?id=" + encodeURIComponent(event.id);
  }

  if (document.body.dataset.page === "detail") renderDetail(); else renderOverview();
}());
