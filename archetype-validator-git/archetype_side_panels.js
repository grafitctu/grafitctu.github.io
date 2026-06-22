(() => {
  const archetypes = [
    {
      id: "innocent",
      name: "Innocent",
      short: "Safety / hope",
      color: "#9bb83d",
      side: "left",
      text: "The Innocent seeks safety, purity, simplicity, trust, and a return to a world that still makes moral sense. In protagonists, this archetype often appears as vulnerability, naivety, optimism, or a desire to preserve goodness despite danger."
    },
    {
      id: "everyman",
      name: "Everyman",
      short: "Belonging",
      color: "#d4c80a",
      side: "left",
      text: "The Everyman is ordinary, relatable, socially grounded, and often defined by survival, community, or everyday moral pressure. In games, this archetype is especially useful for non-heroic protagonists, civilians, workers, clerks, survivors, or reluctant participants."
    },
    {
      id: "hero",
      name: "Hero",
      short: "Courage",
      color: "#d79a16",
      side: "left",
      text: "The Hero is defined by struggle, courage, confrontation, endurance, and the willingness to face danger. This does not always mean moral purity; many heroic protagonists are damaged, reluctant, or compromised, but their role is structured around overcoming."
    },
    {
      id: "caregiver",
      name: "Caregiver",
      short: "Protection",
      color: "#cf7623",
      side: "left",
      text: "The Caregiver is motivated by protection, responsibility, sacrifice, repair, and care for another person or community. In games, this often appears in parent-child plots, escort structures, healing roles, rescue missions, or protagonists whose violence is framed as protection."
    },
    {
      id: "explorer",
      name: "Explorer",
      short: "Freedom",
      color: "#c84d53",
      side: "left",
      text: "The Explorer seeks freedom, discovery, movement, unknown spaces, and self-definition beyond imposed boundaries. This archetype is common in adventure, open-world, travel, archaeology, survival, and exploration-driven games."
    },
    {
      id: "rebel",
      name: "Rebel",
      short: "Liberation",
      color: "#bf2d75",
      side: "left",
      text: "The Rebel, Outlaw, or Revolutionary resists authority, breaks rules, attacks oppressive systems, or rejects imposed identities. Rebel protagonists may be heroic, comic, criminal, or destructive; the key is their oppositional relation to order."
    },
    {
      id: "lover",
      name: "Lover",
      short: "Intimacy",
      color: "#934091",
      side: "right",
      text: "The Lover is driven by intimacy, attachment, desire, beauty, devotion, or emotional connection. This archetype is not limited to romance; it can also describe protagonists whose core motivation is relational, aesthetic, sensual, or deeply personal."
    },
    {
      id: "creator",
      name: "Creator",
      short: "Creation",
      color: "#315fa4",
      side: "right",
      text: "The Creator is defined by making, shaping, building, designing, inventing, composing, or transforming material into form. In games, this can describe named artists and inventors, but also player roles in construction, crafting, colony, and sandbox systems."
    },
    {
      id: "jester",
      name: "Jester",
      short: "Play",
      color: "#1681b3",
      side: "right",
      text: "The Jester uses play, humor, irony, trickery, absurdity, improvisation, or refusal of seriousness. Jester protagonists can be comic heroes, tricksters, fools, pranksters, or chaotic figures who expose the fragility of social order."
    },
    {
      id: "sage",
      name: "Sage",
      short: "Knowledge",
      color: "#0797b5",
      side: "right",
      text: "The Sage seeks truth, knowledge, interpretation, investigation, memory, or understanding. Detectives, scholars, hackers, scientists, witnesses, and puzzle-solving protagonists often carry Sage functions, especially when the central action is finding out what is really going on."
    },
    {
      id: "magician",
      name: "Magician",
      short: "Transformation",
      color: "#198f88",
      side: "right",
      text: "The Magician transforms reality, perception, selfhood, or systems. This archetype appears in literal magic, hacking, psychic powers, technological manipulation, occult knowledge, or protagonists whose role is to alter the rules of the world."
    },
    {
      id: "ruler",
      name: "Ruler",
      short: "Control",
      color: "#0aa66f",
      side: "right",
      text: "The Ruler seeks order, control, leadership, responsibility, command, law, or systemic power. In games, this archetype is common not only in kings, commanders, and bosses, but also in strategy, management, city-building, and political simulations."
    }
  ];

  const css = `
    .side-archetypes {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 50;
      pointer-events: none;
    }

    .side-archetypes.left { left: 0; }
    .side-archetypes.right { right: 0; }

    .side-panel {
      --panel-color: #111;
      position: relative;
      width: 230px;
      min-height: 54px;
      border: 0;
      padding: 0;
      margin: 0;
      background: transparent;
      pointer-events: auto;
      cursor: pointer;
      font: inherit;
      text-align: left;
      color: #fff;
      filter: drop-shadow(0 8px 18px rgba(0,0,0,.18));
      transition: transform .22s ease, filter .22s ease;
    }

    .side-archetypes.left .side-panel {
      transform: translateX(-176px);
    }

    .side-archetypes.right .side-panel {
      transform: translateX(176px);
    }

    .side-archetypes.left .side-panel.open,
    .side-archetypes.left .side-panel:hover {
      transform: translateX(0);
    }

    .side-archetypes.right .side-panel.open,
    .side-archetypes.right .side-panel:hover {
      transform: translateX(0);
    }

    .side-panel-inner {
      display: grid;
      grid-template-columns: 54px 1fr;
      min-height: 54px;
      background: var(--panel-color);
      overflow: hidden;
    }

    .side-archetypes.left .side-panel-inner {
      border-radius: 0 14px 14px 0;
    }

    .side-archetypes.right .side-panel-inner {
      grid-template-columns: 1fr 54px;
      border-radius: 14px 0 0 14px;
    }

    .side-tab {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 54px;
      background: rgba(0,0,0,.12);
      font-size: 10px;
      line-height: 1;
      font-weight: 950;
      letter-spacing: .08em;
      text-transform: uppercase;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      user-select: none;
    }

    .side-archetypes.right .side-tab {
      order: 2;
      writing-mode: vertical-lr;
    }

    .side-content {
      padding: 8px 11px 9px;
      min-width: 0;
    }

    .side-title {
      margin: 0;
      font-size: 13px;
      line-height: 1.05;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    .side-short {
      margin: 3px 0 0;
      font-size: 11px;
      line-height: 1.1;
      font-weight: 800;
      opacity: .92;
    }

    .side-detail {
      display: none;
      margin: 7px 0 0;
      font-size: 11px;
      line-height: 1.25;
      opacity: .96;
    }

    .side-panel.open {
      width: 300px;
      filter: drop-shadow(0 12px 26px rgba(0,0,0,.24));
    }

    .side-panel.open .side-panel-inner {
      min-height: 132px;
    }

    .side-panel.open .side-detail {
      display: block;
    }

    .side-panel:focus-visible {
      outline: 4px solid #111827;
      outline-offset: 2px;
    }

    @media (max-width: 760px) {
      .side-archetypes {
        gap: 5px;
      }

      .side-panel {
        width: 176px;
        min-height: 42px;
      }

      .side-archetypes.left .side-panel {
        transform: translateX(-135px);
      }

      .side-archetypes.right .side-panel {
        transform: translateX(135px);
      }

      .side-panel.open {
        width: min(270px, 82vw);
      }

      .side-panel-inner {
        grid-template-columns: 41px 1fr;
        min-height: 42px;
      }

      .side-archetypes.right .side-panel-inner {
        grid-template-columns: 1fr 41px;
      }

      .side-tab {
        min-height: 42px;
        font-size: 8px;
        letter-spacing: .06em;
      }

      .side-content {
        padding: 6px 8px 7px;
      }

      .side-title {
        font-size: 11px;
      }

      .side-short {
        font-size: 9.5px;
      }

      .side-detail {
        font-size: 10px;
        line-height: 1.2;
      }
    }

    @media (max-width: 420px) {
      .side-panel {
        width: 156px;
      }

      .side-archetypes.left .side-panel {
        transform: translateX(-119px);
      }

      .side-archetypes.right .side-panel {
        transform: translateX(119px);
      }

      .side-panel.open {
        width: min(260px, 86vw);
      }
    }
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const left = document.createElement("div");
  left.className = "side-archetypes left";
  left.setAttribute("aria-label", "Left archetype descriptions");

  const right = document.createElement("div");
  right.className = "side-archetypes right";
  right.setAttribute("aria-label", "Right archetype descriptions");

  function makePanel(a) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "side-panel";
    btn.style.setProperty("--panel-color", a.color);
    btn.dataset.archetype = a.id;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", `${a.name}: ${a.short}`);

    btn.innerHTML = `
      <div class="side-panel-inner">
        <div class="side-tab">${a.short}</div>
        <div class="side-content">
          <p class="side-title">${a.name}</p>
          <p class="side-short">${a.short}</p>
          <p class="side-detail">${a.text}</p>
        </div>
      </div>
    `;

    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const wasOpen = btn.classList.contains("open");
      document.querySelectorAll(".side-panel.open").forEach(p => {
        p.classList.remove("open");
        p.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        btn.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });

    return btn;
  }

  archetypes.forEach(a => {
    if (a.side === "left") left.appendChild(makePanel(a));
    else right.appendChild(makePanel(a));
  });

  document.body.appendChild(left);
  document.body.appendChild(right);

  document.addEventListener("click", () => {
    document.querySelectorAll(".side-panel.open").forEach(p => {
      p.classList.remove("open");
      p.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.querySelectorAll(".side-panel.open").forEach(p => {
        p.classList.remove("open");
        p.setAttribute("aria-expanded", "false");
      });
    }
  });
})();
