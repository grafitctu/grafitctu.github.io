(function () {
  "use strict";

  const lang = document.documentElement.lang === "en" ? "en" : "cs";
  const root = document.body.dataset.root || "../";
  const AUTOPLAY_MS = 14000;
  const publicOrigin = "https://grafitctu.github.io";

  const copy = {
    cs: {
      selected: "v prezentaci",
      selectedGame: "Výběr studentských her",
      openProject: "Otevřít projekt",
      learnMore: "Zjistit víc",
      programmeCard: "VCGD · kapitola o oboru",
      unavailable: "Bez veřejného odkazu",
      shown: (count) => `Zobrazeno ${count} ${count === 1 ? "projekt" : count >= 2 && count <= 4 ? "projekty" : "projektů"}`,
      pause: "Pauza",
      play: "Pokračovat",
      pauseAria: "Pozastavit automatické přehrávání",
      playAria: "Pokračovat v automatickém přehrávání",
      qrAlt: "QR odkaz na projekt"
    },
    en: {
      selected: "in presentation",
      selectedGame: "Selected student games",
      openProject: "Open project",
      learnMore: "Learn more",
      programmeCard: "VCGD · programme chapter",
      unavailable: "No public link",
      shown: (count) => `Showing ${count} ${count === 1 ? "project" : "projects"}`,
      pause: "Pause",
      play: "Continue",
      pauseAria: "Pause automatic playback",
      playAria: "Continue automatic playback",
      qrAlt: "QR link to project"
    }
  }[lang];

  const placeholder = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#11172c"/><stop offset="1" stop-color="#050814"/></linearGradient></defs><rect width="1200" height="750" fill="url(#g)"/><g fill="none" stroke="#ffd43b" stroke-width="18" opacity=".72"><path d="M490 257 600 193l110 64v127l-110 64-110-64z"/><path d="m490 257 110 64 110-64M600 321v127"/></g><text x="600" y="540" fill="#aeb5ca" font-family="Arial,sans-serif" font-size="34" text-anchor="middle">GRAFIT · FIT CTU</text></svg>`
  );

  function localized(value) {
    if (value && typeof value === "object") return value[lang] || value.cs || value.en || "";
    return value == null ? "" : String(value);
  }

  function assetUrl(value) {
    if (!value) return placeholder;
    if (/^(?:https?:|data:|blob:)/i.test(value)) return value;
    if (location.protocol === "file:" && value.startsWith("/")) {
      return new URL(root + value.slice(1), location.href).href;
    }
    return value;
  }

  function publicUrl(value) {
    if (!value) return "";
    try {
      return new URL(value, publicOrigin).href;
    } catch (_) {
      return "";
    }
  }

  function destinationUrl(value) {
    if (!value) return "";
    if (location.protocol === "file:" && value.startsWith("/")) return assetUrl(value);
    return value;
  }

  function classify(game) {
    const haystack = `${localized(game.type)} ${localized(game.platforms)}`.toLocaleLowerCase("cs");
    if (/game\s?jam/.test(haystack)) return "gamejam";
    if (/bakalář|diplom|závěreč|bachelor|master thesis|thesis/.test(haystack)) return "thesis";
    if (/fyzick|physical|deskov|board game|únikov/.test(haystack)) return "physical";
    return "other";
  }

  function normalizeGame(tuple, index) {
    const game = {
      kind: "game",
      id: `game-${index + 1}`,
      title: localized(tuple[0]),
      type: localized(tuple[1]),
      platforms: localized(tuple[2]),
      href: tuple[3] || "",
      image: (window.GRAFIT_GAME_COVERS || {})[tuple[3]] || tuple[4] || "",
      present: Number(tuple[5]) === 1,
      description: lang === "en" ? (tuple[7] || tuple[6] || "") : (tuple[6] || tuple[7] || "")
    };
    game.category = classify(game);
    game.accent = game.category === "gamejam" ? "purple" : game.category === "thesis" ? "blue" : game.category === "physical" ? "orange" : "yellow";
    return game;
  }

  function normalizeStory(story) {
    return {
      kind: "story",
      id: story.id,
      after: Math.max(0, Number(story.after) || 0),
      title: localized(story.title),
      eyebrow: localized(story.eyebrow),
      description: localized(story.text),
      href: story.href || "",
      image: story.image || "",
      accent: story.accent || "yellow"
    };
  }

  const games = (window.GRAFIT_GAMES || []).map(normalizeGame);
  const stories = (window.GRAFIT_GAME_STORIES || []).map(normalizeStory);
  const presentationGames = games.filter((game) => game.present);

  function buildDeck() {
    const deck = [];
    const groupedStories = new Map();
    stories.forEach((story) => {
      const position = Math.min(story.after, presentationGames.length);
      if (!groupedStories.has(position)) groupedStories.set(position, []);
      groupedStories.get(position).push(story);
    });
    for (let index = 0; index <= presentationGames.length; index += 1) {
      (groupedStories.get(index) || []).forEach((story) => deck.push(story));
      if (index < presentationGames.length) deck.push(presentationGames[index]);
    }
    return deck;
  }

  const deck = buildDeck();

  document.querySelectorAll("[data-game-count]").forEach((node) => { node.textContent = String(games.length); });
  document.querySelectorAll("[data-slide-count]").forEach((node) => { node.textContent = String(deck.length); });

  function makeImage(src, alt, loading) {
    const image = document.createElement("img");
    image.src = assetUrl(src);
    image.alt = alt || "";
    if (loading) image.loading = loading;
    image.decoding = "async";
    image.addEventListener("error", () => {
      if (image.src !== placeholder) image.src = placeholder;
    }, { once: true });
    return image;
  }

  function appendBadge(container, text, className) {
    if (!text) return;
    const badge = document.createElement("span");
    badge.textContent = text;
    if (className) badge.className = className;
    container.appendChild(badge);
  }

  function gameCard(game) {
    const article = document.createElement("article");
    article.className = "game-card";
    article.dataset.category = game.category;
    article.dataset.presentation = game.present ? "true" : "false";

    const content = document.createElement(game.href ? "a" : "div");
    content.className = "game-card-link";
    if (game.href) {
      content.href = destinationUrl(game.href);
      if (/^https?:/i.test(game.href)) {
        content.target = "_blank";
        content.rel = "noopener";
      }
    }

    const media = document.createElement("div");
    media.className = "game-card-media";
    media.appendChild(makeImage(game.image, game.title, "lazy"));
    if (game.present) {
      const selected = document.createElement("span");
      selected.className = "selection-badge";
      selected.textContent = `▶ ${copy.selected}`;
      media.appendChild(selected);
    }

    const body = document.createElement("div");
    body.className = "game-card-copy";
    const title = document.createElement("h3");
    title.textContent = game.title;
    const description = document.createElement("p");
    description.className = "game-card-description";
    description.textContent = game.description;
    const badges = document.createElement("div");
    badges.className = "game-card-badges";
    appendBadge(badges, game.type);
    appendBadge(badges, game.platforms);
    if (game.href) appendBadge(badges, "↗", "game-card-arrow");
    body.append(title, description, badges);
    content.append(media, body);
    article.appendChild(content);
    return article;
  }

  const grid = document.querySelector("[data-games-grid]");
  if (grid) {
    const fragment = document.createDocumentFragment();
    games.forEach((game) => fragment.appendChild(gameCard(game)));
    grid.appendChild(fragment);
  }

  const resultCount = document.querySelector("[data-results-count]");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));

  function filterGallery(filter) {
    let visible = 0;
    document.querySelectorAll(".game-card").forEach((card) => {
      const matches = filter === "all" ||
        (filter === "presentation" && card.dataset.presentation === "true") ||
        card.dataset.category === filter;
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    filterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === filter)));
    if (resultCount) resultCount.textContent = copy.shown(visible);
  }

  filterButtons.forEach((button) => button.addEventListener("click", () => filterGallery(button.dataset.filter)));
  filterGallery("all");

  const stage = document.querySelector(".presentation-stage[data-presentation]");
  if (!stage || deck.length === 0) return;

  const stageBg = stage.querySelector("[data-presentation-bg]");
  const slideImage = stage.querySelector("[data-slide-image]");
  const slideEyebrow = stage.querySelector("[data-slide-eyebrow]");
  const slideTitle = stage.querySelector("[data-slide-title]");
  const slideMeta = stage.querySelector("[data-slide-meta]");
  const slideText = stage.querySelector("[data-slide-text]");
  const slideLinkWrap = stage.querySelector(".presentation-link");
  const slideLink = stage.querySelector("[data-slide-link]");
  const slideQr = stage.querySelector("[data-slide-qr]");
  const slideLinkLabel = stage.querySelector("[data-slide-link-label]");
  const slideLinkTitle = stage.querySelector("[data-slide-link-title]");
  const slideCurrent = stage.querySelector("[data-slide-current]");
  const slideTotal = stage.querySelector("[data-slide-total]");
  const pauseButton = stage.querySelector("[data-slide-pause]");
  const pauseIcon = stage.querySelector("[data-pause-icon]");
  const pauseLabel = stage.querySelector("[data-pause-label]");
  const progress = stage.querySelector("[data-slide-progress]");
  const presentationLanguage = stage.querySelector("[data-presentation-language]");

  let active = false;
  let currentIndex = 0;
  let paused = false;
  let elapsed = 0;
  let lastFrame = performance.now();
  let animationFrame = 0;
  let previousFocus = null;
  let pointerStartX = null;

  slideTotal.textContent = String(deck.length);

  function linkDisplayName(url, fallback) {
    if (!url) return copy.unavailable;
    try {
      const parsed = new URL(url, publicOrigin);
      return parsed.hostname === "grafitctu.github.io" ? fallback : parsed.hostname.replace(/^www\./, "");
    } catch (_) {
      return fallback;
    }
  }

  function setPresentationLanguageLink() {
    if (!presentationLanguage) return;
    const base = new URL(presentationLanguage.getAttribute("href").split("?")[0], location.href);
    base.searchParams.set("present", "1");
    base.searchParams.set("slide", String(currentIndex + 1));
    presentationLanguage.href = base.href;
  }

  function syncRegularLanguageLink() {
    document.querySelectorAll("[data-language-link]").forEach((link) => {
      const original = link.dataset.cleanHref || link.getAttribute("href").split("?")[0];
      link.dataset.cleanHref = original;
      const target = new URL(original, location.href);
      if (active) {
        target.searchParams.set("present", "1");
        target.searchParams.set("slide", String(currentIndex + 1));
      }
      link.href = target.href;
    });
  }

  function syncUrl() {
    const url = new URL(location.href);
    if (active) {
      url.searchParams.set("present", "1");
      url.searchParams.set("slide", String(currentIndex + 1));
    } else {
      url.searchParams.delete("present");
      url.searchParams.delete("slide");
      if (url.hash === "#presentation") url.hash = "";
    }
    try {
      history.replaceState(null, "", url);
    } catch (_) {
      // Local file previews can reject History API writes; presentation remains functional.
    }
    setPresentationLanguageLink();
    syncRegularLanguageLink();
  }

  function resetClock() {
    elapsed = 0;
    lastFrame = performance.now();
    if (progress) progress.style.width = "0%";
  }

  function renderSlide(index, updateAddress) {
    currentIndex = (index + deck.length) % deck.length;
    const item = deck[currentIndex];
    const imageUrl = assetUrl(item.image);
    stage.dataset.accent = item.accent || "yellow";
    stage.dataset.kind = item.kind;
    stageBg.style.backgroundImage = `url("${imageUrl.replace(/["\\]/g, "\\$&")}")`;
    slideImage.src = imageUrl;
    slideImage.alt = item.title;
    slideImage.onerror = () => { slideImage.onerror = null; slideImage.src = placeholder; };
    slideEyebrow.textContent = item.kind === "story" ? item.eyebrow : copy.selectedGame;
    slideTitle.textContent = item.title;
    slideMeta.textContent = item.kind === "story"
      ? copy.programmeCard
      : [item.type, item.platforms].filter(Boolean).join(" · ");
    slideText.textContent = item.description;
    slideCurrent.textContent = String(currentIndex + 1);

    if (item.href) {
      const destination = destinationUrl(item.href);
      const publicDestination = publicUrl(item.href);
      slideLinkWrap.hidden = false;
      slideLink.href = destination;
      slideLink.target = /^https?:/i.test(item.href) ? "_blank" : "_self";
      slideLinkLabel.textContent = item.kind === "story" ? copy.learnMore : copy.openProject;
      slideLinkTitle.textContent = linkDisplayName(publicDestination, item.title);
      slideQr.alt = copy.qrAlt;
      slideQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(publicDestination)}`;
    } else {
      slideLinkWrap.hidden = true;
    }

    resetClock();
    if (updateAddress !== false) syncUrl();
  }

  function updatePauseButton() {
    pauseIcon.textContent = paused ? "▶" : "Ⅱ";
    pauseLabel.textContent = paused ? copy.play : copy.pause;
    pauseButton.setAttribute("aria-label", paused ? copy.playAria : copy.pauseAria);
    pauseButton.setAttribute("aria-pressed", String(paused));
  }

  function setPaused(value) {
    paused = value;
    lastFrame = performance.now();
    updatePauseButton();
  }

  function nextSlide() { renderSlide(currentIndex + 1); }
  function previousSlide() { renderSlide(currentIndex - 1); }

  function animate(now) {
    if (!active) return;
    if (!paused && !document.hidden) {
      elapsed += Math.min(now - lastFrame, 250);
      if (elapsed >= AUTOPLAY_MS) {
        nextSlide();
      } else if (progress) {
        progress.style.width = `${Math.min(100, elapsed / AUTOPLAY_MS * 100)}%`;
      }
    }
    lastFrame = now;
    animationFrame = requestAnimationFrame(animate);
  }

  function openPresentation(requestedIndex) {
    previousFocus = document.activeElement;
    active = true;
    paused = false;
    stage.classList.add("is-active");
    stage.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-presenting");
    renderSlide(Number.isFinite(requestedIndex) ? requestedIndex : currentIndex, false);
    updatePauseButton();
    syncUrl();
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(animate);
    stage.querySelector("[data-presentation-close]").focus({ preventScroll: true });
  }

  function closePresentation() {
    active = false;
    cancelAnimationFrame(animationFrame);
    stage.classList.remove("is-active");
    stage.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-presenting");
    syncUrl();
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus({ preventScroll: true });
  }

  document.querySelectorAll("[data-presentation-open]").forEach((button) => button.addEventListener("click", () => openPresentation(0)));
  stage.querySelector("[data-presentation-close]").addEventListener("click", closePresentation);
  stage.querySelector("[data-slide-prev]").addEventListener("click", previousSlide);
  stage.querySelector("[data-slide-next]").addEventListener("click", nextSlide);
  pauseButton.addEventListener("click", () => setPaused(!paused));

  stage.addEventListener("pointerdown", (event) => { pointerStartX = event.clientX; });
  stage.addEventListener("pointerup", (event) => {
    if (pointerStartX == null) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(distance) > 70) distance > 0 ? previousSlide() : nextSlide();
  });

  document.addEventListener("keydown", (event) => {
    if (!active) return;
    if (["ArrowRight", "PageDown"].includes(event.key)) { event.preventDefault(); nextSlide(); }
    else if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); previousSlide(); }
    else if (event.key === " ") { event.preventDefault(); setPaused(!paused); }
    else if (event.key === "Escape") { event.preventDefault(); closePresentation(); }
    else if (event.key === "Home") { event.preventDefault(); renderSlide(0); }
    else if (event.key === "End") { event.preventDefault(); renderSlide(deck.length - 1); }
  });

  const initialUrl = new URL(location.href);
  const initial = initialUrl.searchParams;
  if (initial.get("present") === "1" || initialUrl.hash === "#presentation") {
    const requested = Math.max(0, Math.min(deck.length - 1, (Number(initial.get("slide")) || 1) - 1));
    openPresentation(requested);
  } else {
    syncRegularLanguageLink();
  }
}());
