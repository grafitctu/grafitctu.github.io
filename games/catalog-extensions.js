(function () {
  "use strict";

  const games = Array.isArray(window.GRAFIT_GAMES) ? window.GRAFIT_GAMES : [];

  function key(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("en")
      .replace(/[^a-z0-9]+/g, "");
  }

  const yearCorrections = new Map([
    ["joke the jaker", "GameJam FIT 2024"],
    ["encore!", "GameJam FIT 2024"],
    ["liminal!", "GameJam FIT 2024"],
    ["skater's paradise", "GameJam FIT 2024"],
    ["alone", "GameJam FIT 2024"],
    ["galaxy golf", "GameJam FIT 2025"],
    ["whitenoise", "GameJam FIT 2025"],
    ["drinking with the devil", "GameJam FIT 2025"],
    ["the princess game", "GameJam FIT 2025"],
    ["cempetary", "GameJam FIT 2025"],
    ["drákulův hrad", { cs: "GameJam FIT 2025 · desková hra", en: "GameJam FIT 2025 · board game" }],
    ["godwork", { cs: "Vánoční GameJam FIT 2024", en: "Christmas GameJam FIT 2024" }],
    ["prophicient", { cs: "Vánoční GameJam FIT 2024", en: "Christmas GameJam FIT 2024" }],
    ["quantumage", { cs: "Velikonoční GameJam FIT 2023", en: "Easter GameJam FIT 2023" }],
    ["dicey rollin'", { cs: "Velikonoční GameJam FIT 2023", en: "Easter GameJam FIT 2023" }],
    ["rota est alea", { cs: "Velikonoční GameJam FIT 2023", en: "Easter GameJam FIT 2023" }],
    ["útěk z brna", "GameJam FIT 2022.2"],
    ["haunted house", "GameJam FIT 2022.2"],
    ["rhune", "GameJam FIT 2022.2"],
    ["spirate", "GameJam FIT 2022.2"],
    ["binary anomaly", "GameJam FIT 2022.2"]
  ].map(([title, type]) => [key(title), type]));

  const canonicalLinks = new Map([
    ["drinking with the devil", "https://simonstrikesback.itch.io/drinking-with-the-devil"],
    ["quantumage", "https://belonzik.itch.io/quantumage"],
    ["rota est alea", "https://trampod.itch.io/rota-est-alea"],
    ["haunted house", "https://fairy-snail-games.itch.io/haunted-house"]
  ].map(([title, href]) => [key(title), href]));

  games.forEach((game) => {
    const titleKey = key(game[0]);
    if (yearCorrections.has(titleKey)) game[1] = yearCorrections.get(titleKey);
    if (canonicalLinks.has(titleKey)) game[3] = canonicalLinks.get(titleKey);
  });

  const additions = [
    [
      "AI na Hrad", "GameJam FIT 2025", "Windows", "https://thund3r3.itch.io/ai-na-hrad",
      "https://img.itch.zone/aW1nLzIwODA5ODEwLnBuZw==/300x240%23c/0jcNYJ.png", 0,
      "Praha roku 2075 je pod kontrolou zlé umělé inteligence E.V.A. Studentská AI se jí v retro FPS pokouší vyrvat Pražský hrad.",
      "Prague in 2075 is controlled by the evil AI E.V.A. A student-built AI fights back in this retro FPS set at Prague Castle."
    ],
    [
      "Animal Stack", "GameJam FIT 2025", "Windows", "https://rincake.itch.io/animal-stack",
      "https://img.itch.zone/aW1nLzIwODA5OTUyLnBuZw==/300x240%23c/VQQf1F.png", 0,
      "Zvířecí skládací výzva, ve které je potřeba z nestabilních tvorů postavit co nejvyšší věž.",
      "An animal-stacking challenge about building the tallest possible tower from a very unstable cast of creatures."
    ],
    [
      "Denied Reincarnation", "GameJam FIT 2025", "Web", "https://trampod.itch.io/denied-reincarnation",
      "https://img.itch.zone/aW1nLzIwODA5NDc0LnBuZw==/300x240%23c/GPw%2BcH.png", 0,
      "Webová gamejamová hra o odmítnutém znovuzrození a cestě duše, která se nechce smířit s konečným verdiktem.",
      "A web game about a denied reincarnation and a soul unwilling to accept the final verdict."
    ],
    [
      "Crusades", "GameJam FIT 2025", "Windows / Linux", "https://indecx.itch.io/crusades",
      "https://img.itch.zone/aW1nLzIwODA5NDcwLmdpZg==/300x240%23c/idDwcj.gif", 0,
      "Akční gamejamový prototyp zasazený do stylizované křížové výpravy, v níž rozhodují rychlé reakce a boj o přežití.",
      "An action game-jam prototype set during a stylised crusade, driven by quick reactions and a fight for survival."
    ],
    [
      "Angel Survivors", "GameJam FIT 2025", "Windows / Linux", "https://tym13.itch.io/angel-survivors",
      "https://img.itch.zone/aW1nLzIwODA5ODM2LnBuZw==/300x240%23c/BZeI7Q.png", 0,
      "Obrana satanského oltáře před nebeskými útoky. Hra ve stylu Vampire Survivors přidává ochranu základny a nákup vylepšení.",
      "Defend a satanic altar from Heaven. The Vampire Survivors-inspired loop adds base defence and purchasable upgrades."
    ],
    [
      "Harmonopolis", "GameJam FIT 2025", { cs: "Fyzická hra", en: "Physical game" }, "https://kurilluk.itch.io/harmopolis",
      "https://img.itch.zone/aW1nLzIwODA4ODg4LnBuZw==/300x240%23cb/plrBSk.png", 0,
      "Minimalistický fyzický hlavolam a stavba města. Podoba létajícího Harmonopolisu se mění podle potřeb jeho obyvatel.",
      "A minimalist physical puzzle and city builder. The layout of flying Harmonopolis changes with the needs of its citizens."
    ],
    [
      "Soulless", "GameJam FIT 2025", "Web", "https://w3ndaf.itch.io/soulless",
      "https://img.itch.zone/aW1nLzIwODAzOTEwLnBuZw==/300x240%23c/KS6%2F7n.png", 0,
      "Top-down hack-and-slash o hledání úlomků duše v hradu Temného rytíře. Obětování a znovuzrození otevírá silnější statistiky.",
      "A top-down hack-and-slash about collecting soul fragments in the Dark Knight's castle. Sacrifice and reincarnation unlock stronger stats."
    ],
    [
      "Tower Defenceless", "GameJam FIT 2025", "Windows / Web", "https://el-sheppe.itch.io/tower-defenseless",
      "https://img.itch.zone/aW1nLzIwODA4ODU2LnBuZw==/300x240%23c/G42iDM.png", 0,
      "Obrácený pohled na tower defence: věž tentokrát není bezpečným bodem a hráč musí přežít bez obvyklé obranné převahy.",
      "A reversed take on tower defence: the tower is no safe haven, and the player must survive without the usual defensive advantage."
    ],
    [
      "B.T.B.D.", "GameJam FIT 2025", "Web", "https://arcusvonsinus.itch.io/btbd",
      "https://img.itch.zone/aW1nLzIwODA3MjczLnBuZw==/300x240%23c/crL16%2F.png", 0,
      "Krátký webový prototyp vytvořený během GameJamu FIT 2025, postavený na rychlém rozhodování a výrazné stylizaci.",
      "A compact web prototype made during FIT GameJam 2025, built around quick decisions and bold visual styling."
    ],
    [
      "Bring Me To Light", { cs: "Vánoční GameJam FIT 2024", en: "Christmas GameJam FIT 2024" }, "Windows / Web", "https://floatwave.itch.io/moth",
      "https://img.itch.zone/aW1nLzE5MDkyMDE2LnBuZw==/300x240%23c/7Di4R8.png", 0,
      "Zlaté světlo vede můru, která neumí dobře létat. Přitažlivá záře jí ukazuje cestu — možná až k vlastnímu konci.",
      "A golden light guides a moth that can barely fly. Its irresistible glow may be leading the creature towards its demise."
    ],
    [
      "Lightkeeper", { cs: "Vánoční GameJam FIT 2024", en: "Christmas GameJam FIT 2024" }, "Windows", "https://stepgames.itch.io/lightkeeper",
      "https://img.itch.zone/aW1nLzE5MDkzMTUyLnBuZw==/300x240%23c/q0EZ0z.png", 0,
      "Atmosférický horor o službě na majáku. Udržujte světlo, chraňte lodě a hlavně přežijte celou směnu.",
      "An atmospheric horror game about tending a lighthouse: keep the light burning, protect the ships and survive the shift."
    ],
    [
      "Snakyval", { cs: "Vánoční GameJam FIT 2024", en: "Christmas GameJam FIT 2024" }, "Windows / macOS / Linux / Web", "https://honzamatousek.itch.io/snakyval",
      "https://img.itch.zone/aW1nLzE5MDkzOTAxLnBuZw==/300x240%23c/6ezPqP.png", 0,
      "Hadí gamejamový prototyp dostupný v prohlížeči i pro hlavní desktopové platformy.",
      "A snake-themed game-jam prototype playable in the browser and across the major desktop platforms."
    ],
    [
      "Čtyři lotři", { cs: "Vánoční GameJam FIT 2024", en: "Christmas GameJam FIT 2024" }, "Windows", "https://duongkha.itch.io/four-bandits1",
      "https://img.itch.zone/aW1nLzE5MDk0NDA2LnBuZw==/300x240%23c/N5y1Ap.png", 0,
      "Česká tahová strategie z fantasy světa. Velíte čtyřem lotrům, kteří se vydávají hledat maják naděje.",
      "A Czech turn-based strategy in a fantasy world. Command four bandits as they set out to find a beacon of hope."
    ],
    [
      "Take Me To The Moon", { cs: "Vánoční GameJam FIT 2024", en: "Christmas GameJam FIT 2024" }, "Windows / Linux", "https://lukydrum.itch.io/take-me-to-the-moon",
      "https://img.itch.zone/aW1nLzE5MDkzMjc3LnBuZw==/300x240%23c/Ehrjb6.png", 0,
      "Gamejamová cesta za Měsícem, která spojuje zimní téma světla s touhou dostat se co nejvýš.",
      "A game-jam journey towards the Moon, combining the winter theme of light with the urge to climb ever higher."
    ],
    [
      "ZATRACENÝ MAJÁK", { cs: "Vánoční GameJam FIT 2024", en: "Christmas GameJam FIT 2024" }, { cs: "Fyzická hra", en: "Physical game" }, "https://vojguard.itch.io/bloody-lighthouse",
      "", 0,
      "Zjistěte, kdo má součásti potřebné ke stavbě majáku, a postavte mu ho. Fyzická hra z vánočního GameJamu FIT.",
      "Find out who holds the parts needed to build a lighthouse, then build it for them. A physical game from the Christmas FIT GameJam."
    ],
    [
      "Ouroblobos", "GameJam FIT 2024", "Windows", "https://itskita.itch.io/ouroblobos",
      "https://img.itch.zone/aW1nLzE1NTkwMDE1LnBuZw==/300x240%23c/sIBej6.png", 0,
      "Top-down hlavolam o útěku roztomilé kapky z podzemní laboratoře. Na cestu má 69 sekund, experimentální zbraň a další testovací subjekty.",
      "A top-down puzzle about a cute blob escaping an underground lab in 69 seconds with an experimental gun and fellow test subjects."
    ],
    [
      "Forgotten Rails", "GameJam FIT 2024", "Windows", "https://he-kireki.itch.io/forgottenrails",
      "https://img.itch.zone/aW1nLzE1NTg5NDg5LnBuZw==/300x240%23c/v6Gfww.png", 0,
      "Reality show korporace Akira slibuje nový život. Opusťte minulost, nastupte do vlaku a dokažte, že budoucnost patří právě vám.",
      "The Akira corporation's reality show promises a new life. Leave the past behind, board the train and prove you belong in the future."
    ],
    [
      "Demon of the Tube v2", "GameJam FIT 2024", "Windows / Linux / Web", "https://el-sheppe.itch.io/demon-of-the-tube-v2",
      "https://img.itch.zone/aW1nLzE1NTkwMzcwLnBuZw==/300x240%23c/QMyvwE.png", 0,
      "Atmosférický koncept soubojového rogueliku ve stylu Doom, zasazený do tunelů metra. Ukazuje základní pohyb, rozhraní a náladu zamýšlené hry.",
      "An atmospheric concept for a Doom-like melee roguelike in metro tunnels, demonstrating the intended movement, interface and mood."
    ],
    [
      "Brave New Town", "GameJam FIT 2024", "Windows / Web", "https://floatwave.itch.io/brave-new-town",
      "https://img.itch.zone/aW1nLzE1NTg0NTUxLnBuZw==/300x240%23c/hxLXEq.png", 0,
      "Postapokalyptická idle hra o sběru surovin a přesvědčování lidí, aby na povrchu pouště založili nové město.",
      "A post-apocalyptic idle and scavenging game about persuading survivors to found a new town on the desert surface."
    ],
    [
      "Chad Chop Chefyo", { cs: "Velikonoční GameJam FIT 2023", en: "Easter GameJam FIT 2023" }, "Windows", "https://cozy-games-studio.itch.io/chad-chop-chefyo",
      "https://img.itch.zone/aW1nLzExODE1MDQ0LmpwZw==/300x240%23c/hS4l0%2F.jpg", 0,
      "Top-down střílečka a vaření během zeleninové apokalypsy. Ulovte smrtící suroviny a servírujte je hostům své restaurace.",
      "A top-down shooter and cooking game set during a vegetable apocalypse. Hunt deadly ingredients and serve them in your restaurant."
    ],
    [
      "Magicman defends a village", { cs: "Velikonoční GameJam FIT 2023", en: "Easter GameJam FIT 2023" }, "Windows", "https://floatwave.itch.io/magicman-defends-a-village",
      "https://img.itch.zone/aW1nLzExODEwOTY3LnBuZw==/300x240%23c/CJIuXV.png", 0,
      "Kouzelnický obránce stojí mezi vesnicí a přicházející pohromou v krátkém akčním gamejamovém prototypu.",
      "A magic-wielding defender stands between a village and the approaching threat in this compact action prototype."
    ],
    [
      "Cube Metamorphosis", { cs: "Velikonoční GameJam FIT 2023", en: "Easter GameJam FIT 2023" }, "Windows", "https://fill-rate.itch.io/cube-metamorphosis",
      "https://img.itch.zone/aW1nLzExODE1MDY5LmpwZw==/300x240%23c/Ixg6DP.jpg", 0,
      "Proměny krychle jsou jádrem krátkého prostorového prototypu vytvořeného během velikonočního GameJamu FIT.",
      "A cube's transformations form the core of this compact spatial prototype from the Easter FIT GameJam."
    ],
    [
      "Save Cubefix!", { cs: "Velikonoční GameJam FIT 2023", en: "Easter GameJam FIT 2023" }, "Windows", "https://icless.itch.io/save-cubefix",
      "https://img.itch.zone/aW1nLzExODEyNTI4LnBuZw==/300x240%23c/2i2Yt3.png", 0,
      "Záchranná výprava za Cubefixem v hravém prototypu postaveném kolem krychlí, překážek a rychlého řešení situací.",
      "A playful rescue mission for Cubefix, built around cubes, obstacles and quick problem-solving."
    ],
    [
      "Spirit of the Forest", "GameJam FIT 2022.2", "Windows", "https://propotato.itch.io/spirit-of-the-forest",
      "https://img.itch.zone/aW1nLzEwNDgwNDY5LnBuZw==/300x240%23c/FHtf1j.png", 0,
      "Lesní duch se vydává chránit svůj domov v atmosférickém studentském prototypu z GameJamu FIT 2022.2.",
      "A forest spirit sets out to protect its home in an atmospheric student prototype from FIT GameJam 2022.2."
    ],
    [
      "Wrath of The Forest", "GameJam FIT 2022.2", "Windows", "https://floatwave.itch.io/wrath-of-the-forest",
      "https://img.itch.zone/aW1nLzEwNDY0MTY0LnBuZw==/300x240%23c/VVYNtk.png", 0,
      "Česká strategie o soupeření dvou duchů o les. Vyřezávejte runy, vysílejte zvířata a vracejte krajině život.",
      "A Czech strategy game about two spirits fighting for a forest: carve runes, send animals and bring the land back to life."
    ],
    [
      "Space Origin", "GameJam FIT 2022.2", "Web", "https://nexgea.itch.io/space-origin",
      "https://img.itch.zone/aW1nLzEwNDY0MTY5LnBuZw==/300x240%23c/c0adVm.png", 0,
      "Webový vesmírný prototyp o hledání původu a průzkumu neznámého prostředí.",
      "A web-based space prototype about tracing an origin and exploring an unfamiliar environment."
    ],
    [
      "Just A Ghost", "GameJam FIT 2022.2", "Windows", "https://metaldragon44.itch.io/just-a-ghost",
      "https://img.itch.zone/aW1nLzEwNDg4NTgzLnBuZw==/300x240%23c/V8RlUB.png", 0,
      "Krátký gamejamový prototyp, ve kterém nejste hrdinou ani monstrem — jste prostě duch.",
      "A compact game-jam prototype where you are neither hero nor monster — you are simply a ghost."
    ],
    [
      "Floor Zer0", "GameJam FIT 2022.2", "Web", "https://huntahsvk.itch.io/floor-zer0",
      "https://img.itch.zone/aW1nLzEwNDYyNzUzLnBuZw==/300x240%23c/pCylXB.png", 0,
      "Webová výprava do nultého podlaží, kde se původ podivného místa odhaluje až během průzkumu.",
      "A web-based descent to floor zero, where the origin of a strange place emerges through exploration."
    ],
    [
      "Plague Snake", "GameJam FIT 2022.2", "Web · puzzle", "https://grekk.itch.io/plague-snake",
      "https://img.itch.zone/aW1nLzEwNDY0MDc1LnBuZw==/300x240%23c/FS4Vu0.png", 0,
      "Hadí logická hra s motivem nákazy, vytvořená během GameJamu FIT 2022.2.",
      "A snake-inspired puzzle game with a plague theme, created during FIT GameJam 2022.2."
    ],
    [
      "Eternal Effort", "GameJam FIT 2022.1", "Web", "https://floatwave.itch.io/eternal-effort-gj",
      "https://img.itch.zone/aW1nLzg2ODc1NjMucG5n/300x240%23c/KJfwoa.png", 0,
      "Osamělý dělník v opuštěné továrně vyrábí baterie pro lampy v mlze. Nikdo si pro ně nepřichází — alespoň zdánlivě.",
      "A lone worker in an abandoned factory makes batteries for lamps in the fog. Nobody comes to collect them — apparently."
    ],
    [
      "Shuffled run", "GameJam FIT 2022.1", "Windows", "https://grekk.itch.io/shuffled-run",
      "https://img.itch.zone/aW1nLzg2ODc1MzkucG5n/300x240%23c/yefGYb.png", 0,
      "Cyberpunková plošinovka, v níž přeskupujete místnosti a samotný svět, abyste unikli z dystopického města budoucnosti.",
      "A cyberpunk platformer where you rearrange rooms and the world itself to escape a dystopian city of the future."
    ],
    [
      "SuezRun", "GameJam FIT 2022.1", "Windows / macOS / Linux", "https://propotato.itch.io/suezrun",
      "https://img.itch.zone/aW1nLzg2ODc0MjgucG5n/300x240%23c/5BZHMo.png", 0,
      "Dopravte náklad Everwood průplavem plným kamenů. Když čas dochází, část nákladu může přes palubu.",
      "Carry Everwood cargo through a rock-filled canal. When time runs short, some of the load may have to go overboard."
    ],
    [
      "Shructure", "GameJam FIT 2022.1", "Windows", "https://vojguard.itch.io/shructure",
      "https://img.itch.zone/aW1nLzg2ODcxMDcucG5n/300x240%23c/bwgplJ.png", 0,
      "Top-down střílečka o útěku z podzemního labyrintu. S ubývajícím zdravím se zmenšujete; po neúspěchu se vracíte silnější.",
      "A top-down shooter about escaping an underground maze. You shrink as health drops, then return stronger after failure."
    ],
    [
      "16000 PSI", "GameJam FIT 2022.1", "Windows / Linux", "https://coalzombik.itch.io/16000-psi",
      "https://img.itch.zone/aW1nLzg2ODc0NDMucG5n/300x240%23c/e1rqTt.png", 0,
      "Průzkum oceánské Propasti pomocí postradatelných dálkově řízených mechů. Mapa, nalezené předměty a informace přetrvávají.",
      "Explore the ocean Abyss with disposable remote-controlled mechs. Your map, recovered items and knowledge persist."
    ]
  ];

  const deduplicated = new Map();
  games.forEach((game) => {
    const titleKey = key(game[0]);
    const previous = deduplicated.get(titleKey);
    if (!previous) {
      deduplicated.set(titleKey, game);
      return;
    }

    const merged = game.slice();
    merged[4] = merged[4] || previous[4];
    merged[5] = Math.max(Number(previous[5]) || 0, Number(merged[5]) || 0);
    merged[6] = merged[6] || previous[6];
    merged[7] = merged[7] || previous[7];
    deduplicated.set(titleKey, merged);
  });

  additions.forEach((game) => {
    const titleKey = key(game[0]);
    if (!deduplicated.has(titleKey)) deduplicated.set(titleKey, game);
  });

  window.GRAFIT_GAMES = Array.from(deduplicated.values());
})();
