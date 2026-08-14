(function () {
  "use strict";

  const lang = document.body.dataset.lang === "en" ? "en" : "cs";
  const generalEvents = [
    { title:{cs:"Návštěva studentů z University of Kanazawa",en:"Visit by students from Kanazawa University"}, date:{cs:"Datum bude doplněno",en:"Date to be added"}, text:{cs:"SAGELab, ggLab, dotyková stěna a studentské hry — včetně Útěku z Brna.",en:"SAGELab, ggLab, the touch wall and student games — including Escape from Brno."}, img:"/assets/projects/gv.png", href:{cs:"kanazawa/",en:"../kanazawa/en/"} },
    { title:{cs:"GameJam FIT 2026",en:"GameJam FIT 2026"}, date:{cs:"3.–10. 4. 2026",en:"3–10 Apr 2026"}, text:{cs:"48 hodin designu, programování, grafiky a improvizace.",en:"48 hours of design, programming, art and improvisation."}, img:"/assets/gamejam/2026/gj26.jpg", href:{cs:"gamejam/",en:"../gamejam/en/"} },
    { title:{cs:"GEXPO 2026",en:"GEXPO 2026"}, date:"2026", text:{cs:"Přehlídka studentských her, VR, vizualizací a závěrečných prací.",en:"A showcase of student games, VR, visualisation and final projects."}, img:"/assets/events/GEXPO/2026a/1g.jpg", href:{cs:"gexpo/2026/",en:"../gexpo/2026/en/"} },
    { title:{cs:"Environment Design v Unreal Engine",en:"Environment Design in Unreal Engine"}, date:{cs:"květen 2026",en:"May 2026"}, text:{cs:"Samostatná bloková výuka s Danielem Triplettem z Purdue University.",en:"A standalone intensive led by Daniel Triplett from Purdue University."}, img:"/assets/events/graficke-vecery/xx-environment-design.jpg", href:{cs:"unreal-course/",en:"../unreal-course/en/"} }
  ];

  const text = (value) => value && typeof value === "object" ? (value[lang] || value.cs || value.en || "") : (value || "");
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const asset = (value) => location.protocol === "file:" && value.startsWith("/") ? new URL((lang === "en" ? "../../" : "../") + value.slice(1), location.href).href : value;

  function card(event, graphicEvening) {
    const href = graphicEvening
      ? (lang === "en" ? `../gvecery/en/event.html?id=${encodeURIComponent(event.id)}` : `gvecery/event.html?id=${encodeURIComponent(event.id)}`)
      : text(event.href);
    return `<a class="event-card" href="${esc(href)}"><img src="${esc(asset(event.img || event.image))}" alt="${esc(text(event.title))}" loading="lazy"><div class="card-body"><div class="date">${esc(text(event.dateLabel || event.date))}</div><h3>${esc(text(event.title))}</h3><p>${esc(text(event.text || event.summary))}</p></div></a>`;
  }

  const generalGrid = document.querySelector("[data-events-grid]");
  if (generalGrid) generalGrid.innerHTML = generalEvents.map((event) => card(event, false)).join("");

  const eveningGrid = document.querySelector("[data-evenings-grid]");
  if (eveningGrid) {
    const evenings = ((window.GRAFIT_EVENINGS || {}).events || [])
      .filter((event) => event.series !== "course")
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    eveningGrid.innerHTML = evenings.map((event) => card(event, true)).join("");
  }
}());
