(function () {
  "use strict";

  const catalogue = window.GRAFIT_THESES;
  const language = document.documentElement.lang === "en" ? "en" : "cs";

  if (!catalogue || !Array.isArray(catalogue.theses)) {
    return;
  }

  const labels = {
    cs: {
      curated: "Kurátorský výběr",
      all: "Všechny práce",
      thesis: (count) => count === 1 ? "práce" : count < 5 ? "práce" : "prací",
      master: "Diplomová práce",
      bachelor: "Bakalářská práce",
      curatedBadge: "Výběr",
      open: "Otevřít záznam práce",
      supervisor: "vedoucí",
      degree: "typ",
      year: "rok",
      search: "hledání",
      pause: "Zastavit pohyb",
      play: "Spustit pohyb",
      lane: "Pás"
    },
    en: {
      curated: "Curated selection",
      all: "All theses",
      thesis: (count) => count === 1 ? "thesis" : "theses",
      master: "Master's thesis",
      bachelor: "Bachelor's thesis",
      curatedBadge: "Selected",
      open: "Open thesis record",
      supervisor: "supervisor",
      degree: "type",
      year: "year",
      search: "search",
      pause: "Pause motion",
      play: "Resume motion",
      lane: "Band"
    }
  };

  const text = labels[language];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = {
    view: "overview",
    scope: "curated",
    paused: reducedMotion.matches,
    interactionPauseUntil: 0,
    hoverCount: 0
  };

  const filters = document.querySelector("[data-filters]");
  const searchInput = document.querySelector("[data-search]");
  const supervisorFilter = document.querySelector("[data-supervisor-filter]");
  const degreeFilter = document.querySelector("[data-degree-filter]");
  const yearFilter = document.querySelector("[data-year-filter]");
  const overviewView = document.querySelector("[data-overview-view]");
  const carouselView = document.querySelector("[data-carousel-view]");
  const thesisGrid = document.querySelector("[data-thesis-grid]");
  const carouselStage = document.querySelector("[data-carousel-stage]");
  const empty = document.querySelector("[data-empty]");
  const resultsCount = document.querySelector("[data-results-count]");
  const resultsLabel = document.querySelector("[data-results-label]");
  const activeFilter = document.querySelector("[data-active-filter]");
  const motionToggle = document.querySelector("[data-motion-toggle]");
  const motionIcon = document.querySelector("[data-motion-icon]");
  const motionLabel = document.querySelector("[data-motion-label]");
  const themeList = document.querySelector("[data-theme-list]");
  const supervisorLinks = document.querySelector("[data-supervisor-links]");

  let animationFrame = 0;
  let previousFrameTime = 0;
  let lanes = [];

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

  function supervisorName(key) {
    return catalogue.supervisors[key]?.name || key;
  }

  function primarySupervisor(thesis) {
    return thesis.supervisors[0];
  }

  function profileUrl(key) {
    const supervisor = catalogue.supervisors[key];
    return supervisor?.profile?.[language] || supervisor?.profile?.cs || "#";
  }

  function setColour(element, key, property = "--supervisor-color") {
    element.style.setProperty(property, catalogue.supervisors[key]?.color || "#58e6f5");
  }

  function thesisCountForSupervisor(key) {
    return catalogue.theses.filter((thesis) => thesis.supervisors.includes(key)).length;
  }

  function initialiseSummary() {
    const curatedCount = catalogue.theses.filter((thesis) => thesis.curated).length;
    document.querySelectorAll("[data-total-theses]").forEach((element) => {
      element.textContent = String(catalogue.theses.length);
    });
    document.querySelectorAll("[data-curated-total]").forEach((element) => {
      element.textContent = String(curatedCount);
    });
    document.querySelectorAll("[data-supervisor-total]").forEach((element) => {
      element.textContent = String(Object.keys(catalogue.supervisors).length);
    });
  }

  function populateFilters() {
    Object.keys(catalogue.supervisors)
      .sort((a, b) => supervisorName(a).localeCompare(supervisorName(b), language))
      .forEach((key) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = `${supervisorName(key)} · ${thesisCountForSupervisor(key)}`;
        supervisorFilter.appendChild(option);
      });

    [...new Set(catalogue.theses.map((thesis) => thesis.year).filter(Boolean))]
      .sort((a, b) => Number(b) - Number(a))
      .forEach((year) => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
      });
  }

  function renderThemeList() {
    const curated = catalogue.theses.filter((thesis) => thesis.curated);
    const fragment = document.createDocumentFragment();
    Object.entries(catalogue.themes).forEach(([key, label]) => {
      const count = curated.filter((thesis) => thesis.theme === key).length;
      if (!count) return;
      const chip = document.createElement("span");
      chip.className = "theme-chip";
      chip.textContent = `${localised(label)} · ${count}`;
      fragment.appendChild(chip);
    });
    themeList.replaceChildren(fragment);
  }

  function renderSupervisorLinks() {
    const fragment = document.createDocumentFragment();
    Object.keys(catalogue.supervisors)
      .sort((a, b) => supervisorName(a).localeCompare(supervisorName(b), language))
      .forEach((key) => {
        const link = document.createElement("a");
        link.href = profileUrl(key);
        link.style.setProperty("--chip-color", catalogue.supervisors[key].color);
        link.innerHTML = `<span class="supervisor-dot"></span><span>${supervisorName(key)} · ${thesisCountForSupervisor(key)}</span><span>↗</span>`;
        fragment.appendChild(link);
      });
    supervisorLinks.replaceChildren(fragment);
  }

  function restoreState() {
    const params = new URLSearchParams(window.location.search);
    if (["overview", "carousel"].includes(params.get("view"))) state.view = params.get("view");
    if (["curated", "all"].includes(params.get("scope"))) state.scope = params.get("scope");
    searchInput.value = params.get("q") || "";
    supervisorFilter.value = params.get("supervisor") || "";
    degreeFilter.value = params.get("degree") || "";
    yearFilter.value = params.get("year") || "";
  }

  function updateUrl() {
    const params = new URLSearchParams();
    if (state.view !== "overview") params.set("view", state.view);
    if (state.scope !== "curated") params.set("scope", state.scope);
    if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
    if (supervisorFilter.value) params.set("supervisor", supervisorFilter.value);
    if (degreeFilter.value) params.set("degree", degreeFilter.value);
    if (yearFilter.value) params.set("year", yearFilter.value);
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }

  function filteredTheses() {
    const query = normalise(searchInput.value.trim());
    return catalogue.theses.filter((thesis) => {
      if (state.scope === "curated" && !thesis.curated) return false;
      if (supervisorFilter.value && !thesis.supervisors.includes(supervisorFilter.value)) return false;
      if (degreeFilter.value && thesis.degree !== degreeFilter.value) return false;
      if (yearFilter.value && thesis.year !== yearFilter.value) return false;
      if (!query) return true;
      const haystack = normalise([
        localised(thesis.title),
        thesis.author,
        thesis.year,
        text[thesis.degree],
        localised(catalogue.themes[thesis.theme]),
        ...thesis.supervisors.map(supervisorName)
      ].join(" "));
      return haystack.includes(query);
    });
  }

  function createBadge(label, className = "") {
    const badge = document.createElement("span");
    badge.className = `card-badge${className ? ` ${className}` : ""}`;
    badge.textContent = label;
    return badge;
  }

  function createSupervisorChip(key) {
    const chip = document.createElement("span");
    chip.className = "supervisor-chip";
    chip.style.setProperty("--chip-color", catalogue.supervisors[key].color);
    const dot = document.createElement("span");
    dot.className = "supervisor-dot";
    const label = document.createElement("span");
    label.textContent = supervisorName(key);
    chip.append(dot, label);
    return chip;
  }

  function createThesisCard(thesis) {
    const wrapper = document.createElement("article");
    const link = document.createElement("a");
    const supervisor = primarySupervisor(thesis);
    link.className = "thesis-card";
    link.href = thesis.url || profileUrl(supervisor);
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute("aria-label", `${text.open}: ${localised(thesis.title)}, ${thesis.author}`);
    setColour(link, supervisor);

    const top = document.createElement("div");
    top.className = "card-topline";
    const badges = document.createElement("div");
    badges.className = "card-badges";
    badges.append(createBadge(thesis.year || "—"), createBadge(text[thesis.degree]));
    if (thesis.curated) badges.append(createBadge(`◎ ${text.curatedBadge}`, "curated"));
    const arrow = document.createElement("span");
    arrow.className = "card-arrow";
    arrow.textContent = "↗";
    top.append(badges, arrow);

    const title = document.createElement("h3");
    title.textContent = localised(thesis.title);
    const author = document.createElement("p");
    author.className = "thesis-author";
    author.textContent = thesis.author;

    const footer = document.createElement("div");
    footer.className = "card-footer";
    const supervisors = document.createElement("div");
    supervisors.className = "card-supervisors";
    thesis.supervisors.forEach((key) => supervisors.appendChild(createSupervisorChip(key)));
    const theme = document.createElement("span");
    theme.className = "theme-chip";
    theme.textContent = localised(catalogue.themes[thesis.theme]);
    footer.append(supervisors, theme);

    link.append(top, title, author, footer);
    wrapper.appendChild(link);
    return wrapper;
  }

  function renderOverview(theses) {
    const fragment = document.createDocumentFragment();
    theses.forEach((thesis) => fragment.appendChild(createThesisCard(thesis)));
    thesisGrid.replaceChildren(fragment);
  }

  function stableCarouselOrder(theses) {
    const themeOrder = Object.keys(catalogue.themes);
    return [...theses].sort((a, b) => {
      const themeDifference = themeOrder.indexOf(a.theme) - themeOrder.indexOf(b.theme);
      if (themeDifference) return themeDifference;
      const yearDifference = Number(b.year || 0) - Number(a.year || 0);
      if (yearDifference) return yearDifference;
      return localised(a.title).localeCompare(localised(b.title), language);
    });
  }

  function createLane(records, index) {
    const lane = document.createElement("div");
    lane.className = "carousel-lane";
    const label = document.createElement("span");
    label.className = "lane-label";
    label.textContent = `${text.lane} ${index + 1}`;

    const viewport = document.createElement("div");
    viewport.className = "lane-viewport";
    viewport.tabIndex = 0;
    viewport.setAttribute("aria-label", `${text.lane} ${index + 1}`);
    const track = document.createElement("div");
    track.className = "lane-track";

    const baseRecords = records.length ? [...records] : [];
    while (baseRecords.length && baseRecords.length < 6) {
      baseRecords.push(...records.slice(0, Math.min(records.length, 6 - baseRecords.length)));
    }
    [...baseRecords, ...baseRecords].forEach((thesis) => {
      const card = createThesisCard(thesis);
      card.classList.add("carousel-card");
      track.appendChild(card);
    });

    const controls = document.createElement("div");
    controls.className = "lane-controls";
    const previous = document.createElement("button");
    previous.className = "lane-control";
    previous.type = "button";
    previous.textContent = "←";
    previous.setAttribute("aria-label", language === "en" ? "Scroll band left" : "Posunout pás doleva");
    const next = document.createElement("button");
    next.className = "lane-control";
    next.type = "button";
    next.textContent = "→";
    next.setAttribute("aria-label", language === "en" ? "Scroll band right" : "Posunout pás doprava");
    controls.append(previous, next);
    viewport.append(track, controls);
    lane.append(label, viewport);

    const pauseForInteraction = () => {
      state.interactionPauseUntil = Date.now() + 3200;
    };
    viewport.addEventListener("pointerenter", () => { state.hoverCount += 1; });
    viewport.addEventListener("pointerleave", () => { state.hoverCount = Math.max(0, state.hoverCount - 1); });
    viewport.addEventListener("focusin", () => { state.hoverCount += 1; });
    viewport.addEventListener("focusout", (event) => {
      if (!viewport.contains(event.relatedTarget)) state.hoverCount = Math.max(0, state.hoverCount - 1);
    });
    viewport.addEventListener("pointerdown", pauseForInteraction);
    viewport.addEventListener("wheel", pauseForInteraction, { passive: true });
    previous.addEventListener("click", () => {
      pauseForInteraction();
      viewport.scrollBy({ left: -350, behavior: "smooth" });
    });
    next.addEventListener("click", () => {
      pauseForInteraction();
      viewport.scrollBy({ left: 350, behavior: "smooth" });
    });

    return {
      element: lane,
      viewport,
      track,
      direction: index === 1 ? -1 : 1,
      speed: [22, 18, 25][index],
      copyWidth: 0
    };
  }

  function stopCarousel() {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousFrameTime = 0;
    lanes = [];
  }

  function animateCarousel(time) {
    if (!previousFrameTime) previousFrameTime = time;
    const delta = Math.min(32, time - previousFrameTime) / 1000;
    previousFrameTime = time;
    const canMove = !state.paused
      && !reducedMotion.matches
      && state.hoverCount === 0
      && Date.now() > state.interactionPauseUntil
      && state.view === "carousel";

    if (canMove) {
      lanes.forEach((lane) => {
        if (!lane.copyWidth) lane.copyWidth = lane.track.scrollWidth / 2;
        if (!lane.copyWidth) return;
        lane.viewport.scrollLeft += lane.direction * lane.speed * delta;
        if (lane.direction > 0 && lane.viewport.scrollLeft >= lane.copyWidth) {
          lane.viewport.scrollLeft -= lane.copyWidth;
        } else if (lane.direction < 0 && lane.viewport.scrollLeft <= 0) {
          lane.viewport.scrollLeft += lane.copyWidth;
        }
      });
    }
    animationFrame = window.requestAnimationFrame(animateCarousel);
  }

  function renderCarousel(theses) {
    stopCarousel();
    state.hoverCount = 0;
    const ordered = stableCarouselOrder(theses);
    const split = [[], [], []];
    ordered.forEach((thesis, index) => split[index % 3].push(thesis));
    lanes = split.map(createLane);
    const fragment = document.createDocumentFragment();
    lanes.forEach((lane) => fragment.appendChild(lane.element));
    carouselStage.replaceChildren(fragment);

    window.requestAnimationFrame(() => {
      lanes.forEach((lane) => {
        lane.copyWidth = lane.track.scrollWidth / 2;
        lane.viewport.scrollLeft = lane.direction < 0 ? lane.copyWidth : 0;
      });
      animationFrame = window.requestAnimationFrame(animateCarousel);
    });
  }

  function updateModeControls() {
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.view === state.view));
    });
    document.querySelectorAll("[data-scope]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.scope === state.scope));
    });
    motionToggle.setAttribute("aria-pressed", String(state.paused));
    motionIcon.textContent = state.paused ? "▶" : "Ⅱ";
    motionLabel.textContent = state.paused ? text.play : text.pause;
  }

  function updateActiveFilter() {
    const active = [state.scope === "curated" ? text.curated : text.all];
    if (searchInput.value.trim()) active.push(`${text.search}: “${searchInput.value.trim()}”`);
    if (supervisorFilter.value) active.push(`${text.supervisor}: ${supervisorName(supervisorFilter.value)}`);
    if (degreeFilter.value) active.push(`${text.degree}: ${text[degreeFilter.value]}`);
    if (yearFilter.value) active.push(`${text.year}: ${yearFilter.value}`);
    activeFilter.textContent = active.join(" · ");
  }

  function render() {
    const theses = filteredTheses();
    overviewView.hidden = state.view !== "overview" || theses.length === 0;
    carouselView.hidden = state.view !== "carousel" || theses.length === 0;
    empty.hidden = theses.length !== 0;

    if (!theses.length) {
      stopCarousel();
      thesisGrid.replaceChildren();
      carouselStage.replaceChildren();
    } else if (state.view === "overview") {
      stopCarousel();
      carouselStage.replaceChildren();
      renderOverview(theses);
    } else {
      thesisGrid.replaceChildren();
      renderCarousel(theses);
    }

    resultsCount.textContent = String(theses.length);
    resultsLabel.textContent = text.thesis(theses.length);
    updateModeControls();
    updateActiveFilter();
    updateUrl();
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });

  document.querySelectorAll("[data-scope]").forEach((button) => {
    button.addEventListener("click", () => {
      state.scope = button.dataset.scope;
      render();
    });
  });

  motionToggle.addEventListener("click", () => {
    state.paused = !state.paused;
    updateModeControls();
  });

  filters.addEventListener("input", render);
  filters.addEventListener("change", render);
  filters.addEventListener("reset", () => {
    window.setTimeout(render, 0);
  });

  reducedMotion.addEventListener("change", (event) => {
    state.paused = event.matches;
    updateModeControls();
  });

  window.addEventListener("pagehide", stopCarousel);

  initialiseSummary();
  populateFilters();
  renderThemeList();
  renderSupervisorLinks();
  restoreState();
  render();
}());
