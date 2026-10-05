# P02 expanded lecture assets

## listener-redraw-v2.png

Clean teaching redraw of `assets/shared/p02_sound2_cb5f892a.png` using the built-in image generation tool, 2026-10-05. Original historical image remains unchanged. This is an illustrative source/listener schematic, not measured propagation.

Final generation prompt:

```
Use case: style-transfer / scientific-educational.
Asset type: a clean raster diagram for the Czech university lecture slide 'Zdroj a posluchač' about spatial game audio.
Input image 1 is the edit target: a hand-drawn rectangular game area, a wedge-shaped avatar at left, a monster at top, a door at right, a loudspeaker at bottom. Redraw this same layout cleanly, preserve the four subjects and their relative positions. The avatar represents the listener, the other three objects are possible sound sources.
Style: sober technical flat illustration, crisp vector-like thin blue-grey outlines, warm white background (#f5f3ed), minimal muted colour, no shading, no texture. Portrait-ish square diagram, abundant blank space and readable large symbols. Use a blue-grey avatar with a clearly visible opening facing right, not a realistic person. Draw the small monster as a simple expressive game icon with two eyes, not scary or detailed. Show two subtle short sound-wave marks beside each sound source. A single thin dotted line from the top monster towards the avatar illustrates source/listener relation; it must not look like a physical wall. Keep the rectangular room border thin and clear.
Text (verbatim, Czech, large dark sans-serif, no other text): next to the avatar 'Posluchač'; below the top monster 'Nepřítel'; next to the right door 'Dveře'; beside the bottom loudspeaker 'Reproduktor'. Spell Czech diacritics exactly. Do not write a title in the image.
Constraints: faithful clean redraw of the original source, four objects only, no 3D perspective, no photograph, no arrows implying physical sound direction, no badges, no decoration, no watermark. This is a teaching schematic, not a simulation of physics.
```

Targeted correction prompt:

```
Edit target: the generated teaching diagram. Make only two small corrections to the listener at left. Mirror the wedge-shaped blue avatar horizontally so that its open wedge faces RIGHT, towards the door. Remove the curved sound-wave marks immediately around the listener so the listener does not appear to be a sound source. Keep the dotted connection to the enemy. Preserve exactly the room, enemy, door, bottom loudspeaker, colours, large Czech labels and every other position. The labels remain verbatim: 'Posluchač', 'Nepřítel', 'Dveře', 'Reproduktor'. No new elements.
```

## dialog-main.wav and dialog-background.wav

Locally generated Czech fictional utterances using an installed Czech Windows voice through Windows.Media.SpeechSynthesis. Both use the same generic synthetic voice, with a different speaking rate for the background utterance. No person was recorded or imitated. No microphone, cloud TTS or downloaded recording is used.

Reproduce with `tools/build_p02_voice.ps1`. The web build reads these WAV assets, embeds their bytes and decodes them inside Web Audio. They also work in the offline HTML.

Main: „Pozor, stráž se vrací. Schovej se za dveře a počkej na můj signál.“

Background: „Našel jsem klíč od skladu. Můžeme pokračovat chodbou na druhou stranu.“

## Original material

Modality illustrations and all five Adam Sporka diagrams use the exact historical files from `assets/shared`, not AI replacements. The source slide numbers and author credit are present in the expanded slide markup.
