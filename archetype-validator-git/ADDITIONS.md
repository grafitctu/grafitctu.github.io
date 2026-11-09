# Shared validation additions (9 November 2026)

The regular and VIP annotation interfaces share the 51 records in [validation_additions_20261109.js](validation_additions_20261109.js). Each record identifies a character, a specific game, a short role description, and its public source. These manually selected items have no suggested archetype labels and are marked `not_validated`; inclusion does not establish agreement or coding validity.

## Existing responses and progress

- The original regular list remains an unchanged prefix of 337 items; the new total is 388.
- The original VIP list remains an unchanged prefix of 373 items, including its 36 pre-existing VIP extras; the new total is 424.
- Arthur Morgan is restored with the historical response ID `arthur_morgan`, at regular position 338 and VIP position 374. Historical response indices are not rewritten; use character IDs when joining responses across list versions.
- New items are appended after each variant's existing list. Do not insert them ahead of old items or VIP extras: the interface restores local progress by index.
- Supplement appends deduplicate by stable ID. Keep the shared addition script before the ordering scripts in both HTML entry points. VIP appends the supplement after its existing extras.
- This extension does not modify submission code, local response logs, participant IDs, storage keys, or saved spreadsheet rows.

## Scope and sources

GTA VI characters are excluded. Expedition 33's six playable party members have separate records. PRAGMATA's Hugh and Diana have separate records, with Diana explicitly identified as a co-protagonist controlled through hacking alongside Hugh ([official gameplay description](https://www.playstation.com/en-us/games/pragmata/)). Existing sequel identities and VIP-only records were not duplicated.

| Character | Game | Source |
|---|---|---|
| Arthur Morgan | Red Dead Redemption 2 | [Official page](https://www.rockstargames.com/newswire/article/4k412883895ka4/Red-Dead-Redemption-2-Now-Available) |
| John Marston | Red Dead Redemption | [Official page](https://www.rockstargames.com/reddeadredemption) |
| Commander Shepard | Mass Effect | [Official page](https://www.ea.com/games/mass-effect/mass-effect-legendary-edition) |
| V | Cyberpunk 2077 | [Official page](https://www.cdprojekt.com/en/media/news/cyberpunk-2077-is-out-now/) |
| Aloy | Horizon Zero Dawn | [Official page](https://blog.playstation.com/2021/09/27/horizon-forbidden-west-evolving-aloy) |
| Ellie | The Last of Us Part II | [Official page](https://blog.playstation.com/2025/07/08/introducing-the-last-of-us-part-ii-remastered-chronological-experience-out-today/) |
| Abby Anderson | The Last of Us Part II | [Official page](https://blog.playstation.com/2025/07/08/introducing-the-last-of-us-part-ii-remastered-chronological-experience-out-today/) |
| Nathan Drake | Uncharted 4: A Thief’s End | [Official page](https://www.playstation.com/en-us/uncharted/) |
| Ezio Auditore | Assassin's Creed II | [Official page](https://www.ubisoft.com/en-us/game/assassins-creed/assassins-creed-ii) |
| Michael De Santa | Grand Theft Auto V | [Official page](https://www.rockstargames.com/newswire/article/o349k552514927/worldwide-grand-theft-auto-v-previews.html) |
| Franklin Clinton | Grand Theft Auto V | [Official page](https://www.rockstargames.com/newswire/article/o349k552514927/worldwide-grand-theft-auto-v-previews.html) |
| Trevor Philips | Grand Theft Auto V | [Official page](https://www.rockstargames.com/newswire/article/o349k552514927/worldwide-grand-theft-auto-v-previews.html) |
| Peter Parker | Marvel’s Spider-Man 2 | [Official page](https://www.marvel.com/games/marvels-spider-man-2) |
| Miles Morales | Marvel’s Spider-Man 2 | [Official page](https://www.marvel.com/games/marvels-spider-man-2) |
| Vito Scaletta | Mafia II | [Official page](https://store.2k.com/game/buy-mafia-2-definitive-edition) |
| Agent 47 | HITMAN World of Assassination | [Official page](https://ioi.dk/hitman/the-cast) |
| Alan Wake | Alan Wake 2 | [Official page](https://community.remedygames.com/game/alan-wake-2/) |
| Saga Anderson | Alan Wake 2 | [Official page](https://community.remedygames.com/game/alan-wake-2/) |
| Isaac Clarke | Dead Space | [Official page](https://www.ea.com/games/dead-space) |
| Zagreus | Hades | [Official page](https://www.supergiantgames.com/blog/hades2-faq/) |
| Jin Sakai | Ghost of Tsushima | [Official page](https://www.playstation.com/en-us/games/ghost-of-tsushima/) |
| Phoenix Wright | Phoenix Wright: Ace Attorney | [Official page](https://store.steampowered.com/app/787480/Phoenix_Wright_Ace_Attorney_Trilogy/) |
| Josef | Machinarium | [Official page](https://store.steampowered.com/app/40700/Machinarium/) |
| Dylan Faden | CONTROL Resonant | [Official page](https://blog.playstation.com/2026/06/02/control-resonant-launches-september-24-on-ps5/) |
| Maelle | Clair Obscur: Expedition 33 | [Official page](https://www.expedition33.com/overview/characters) |
| Gustave | Clair Obscur: Expedition 33 | [Official page](https://www.expedition33.com/overview/characters) |
| Verso | Clair Obscur: Expedition 33 | [Official page](https://www.expedition33.com/overview/characters) |
| Melinoë | Hades II | [Official page](https://www.supergiantgames.com/blog/hades2-faq/) |
| Atsu | Ghost of Yōtei | [Official page](https://www.playstation.com/en-us/games/ghost-of-yotei/) |
| Enzo Favara | Mafia: The Old Country | [Official page](https://newsroom-uk.2k.com/news/mafia-the-old-country-launching-august-8-2025-debuts-official-gameplay-trailer-and-developer-insights-video) |
| Naoe | Assassin's Creed Shadows | [Official page](https://www.ubisoft.com/en-us/game/assassins-creed/shadows) |
| Yasuke | Assassin's Creed Shadows | [Official page](https://www.ubisoft.com/en-us/game/assassins-creed/shadows) |
| Grace Ashcroft | Resident Evil Requiem | [Official page](https://us-store.captown.capcom.com/blogs/news/0000005) |
| James Bond | 007 First Light | [Official page](https://ioi.dk/007firstlightgame/news/2026/007-first-light-launches-globally) |
| Arjun Devraj | SAROS | [Official page](https://sonyinteractive.com/en/press-releases/2026/saros-launches-worldwide-exclusively-on-playstation5/) |
| Logan / Wolverine | Marvel's Wolverine | [Official page](https://sonyinteractive.com/en/press-releases/2026/marvels-wolverine-launches-worldwide/) |
| Hugh | PRAGMATA | [Official page](https://www.playstation.com/en-us/games/pragmata/) |
| Kliff | Crimson Desert | [Official page](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=57) |
| EVE | Stellar Blade | [Official page](https://www.playstation.com/en-us/games/stellar-blade/) |
| The Destined One | Black Myth: Wukong | [Official page](https://www.playstation.com/en-us/games/black-myth-wukong/) |
| Princess Zelda | The Legend of Zelda: Echoes of Wisdom | [Official page](https://www.nintendo.com/us/store/products/the-legend-of-zelda-echoes-of-wisdom-switch/) |
| Donkey Kong | Donkey Kong Bananza | [Official page](https://www.nintendo.com/us/gaming-systems/switch-2/featured-games/donkey-kong-bananza/story-and-characters/) |
| Kirby | Kirby and the Forgotten Land | [Official page](https://kirby.nintendo.com/about/) |
| Ratchet | Ratchet & Clank: Rift Apart | [Official page](https://www.playstation.com/en-us/games/ratchet-and-clank-rift-apart/) |
| Rivet | Ratchet & Clank: Rift Apart | [Official page](https://www.playstation.com/en-us/games/ratchet-and-clank-rift-apart/) |
| Spyro | Spyro Reignited Trilogy | [Official page](https://support.activision.com/spyro/articles/spyro-reignited-trilogy-faq) |
| Clive Rosfield | Final Fantasy XVI | [Official page](https://www.playstation.com/en-us/games/final-fantasy-xvi/) |
| Lune | Clair Obscur: Expedition 33 | [Official page](https://www.expedition33.com/overview/characters) |
| Sciel | Clair Obscur: Expedition 33 | [Official page](https://www.expedition33.com/overview/characters) |
| Monoco | Clair Obscur: Expedition 33 | [Official page](https://www.expedition33.com/overview/characters) |
| Diana | PRAGMATA | [Official page](https://www.playstation.com/en-us/games/pragmata/) |

## Verification

Node VM checks against the preceding main revision confirmed deep equality of both entire original prefixes, unique IDs, deterministic repeated preparation, idempotent supplement appending, the original Arthur ID, matching additions in both variants, exclusion of GTA VI, unchanged mock response logs and progress, and correct VIP submission routing. Local browser previews loaded 388 and 424 items and rendered Arthur with his game, role and source. No annotation was submitted during these checks.
