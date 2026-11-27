# Zgorzelec 1981

Ein Browserspiel in Pixel-Optik: Du bist Grenzbeamter am Übergang Zgorzelec–Görlitz während des Kriegsrechts in Polen (1981–1983).
Du prüfst Papiere, durchsuchst Autos und Gepäck und entscheidest: durchlassen, abweisen oder festnehmen.
Von deinem Lohn müssen Ewa, Tosia und Paweł satt und warm werden.

**Spielen:** https://shadowghost22417.github.io/Project-81/

## So wird gespielt
- **Person antippen:** Fragen stellen. Die Antworten landen im Protokoll.
- **Auto antippen:** hinausgehen, Klappen und Türen per Wischgeste öffnen, Kennzeichen notieren, Koffer öffnen, Verstecke mit Taschenlampe, Messer, Schraubenzieher oder Brecheisen untersuchen.
- **Rotstift:** zwei Angaben einkreisen, die sich widersprechen (auch Regeln aus der Dienstanweisung).
- **Stempel:** im Pass zur Stempelseite blättern, ZEZWOLONO oder ODMOWA stempeln, Pass in die Durchreiche ziehen.
- **Handschellen:** auf die Person ziehen, um sie festzunehmen.
- **Teczka:** Dienstanweisung, Dalekopis (Anweisungen des Tages), Fahndungsliste, Fahrzeugtypen und Dienstbuch.
- **Umschlag:** auf die Teczka ziehen = Bestechung annehmen, in die Durchreiche = zurückgeben.
- **Vorhalten:** Nach einem eingekreisten Widerspruch oder einem Fund kannst du ihn der Person im Gespräch vorhalten. Ein Geständnis zählt als Beweis.
- **Einstellungen (Zahnrad):** Ton, Lautstärken, Weihnachtsdeko, Übersetzungen.

## Kapitel 1: Kriegsrecht
Zehn Schichten vom 14.12.1981 bis zum 22.07.1983. Jeden Morgen gibt es eine Zeitung mit echten Ereignissen jener Zeit,
neue oder geänderte Regeln und Tagesanweisungen. Wiederkehrende Figuren stellen dich vor Entscheidungen, die nachwirken.
Am Abend kaufst du Essen, Trinken, Kohle und Medizin. Wer zu oft scheitert, verliert die Familie oder den Job.
Der Spielstand wird im Browser gespeichert.

## Dateien
| Datei | Inhalt |
|---|---|
| `index.html`, `style.css` | Oberfläche und Gestaltung |
| `data.js` | Namen, Autos, Fehlerarten, Erzeugung der Reisenden |
| `rules.js` | Regeln der Dienstanweisung und ihre Prüfung |
| `story.js` | Kampagne, Zeitungstexte, Tagesanweisungen, Figuren |
| `pixel.js` | Alle Grafiken, im Code gezeichnet |
| `audio.js` | Alle Geräusche, im Code erzeugt |
| `documents.js`, `hut.js`, `interrogation.js`, `car.js`, `tools.js` | Spielmechaniken in der Hütte und draußen |
| `interior.js` | Gezeichnete Innenansichten beim Durchsuchen |
| `photos.js` | Pressefotos der Zeitung (eigene Pixel-Zeichnungen) |
| `family.js`, `newspaper.js`, `save.js`, `game.js` | Abrechnung mit Familienszene, Zeitung, Speichern, Spielablauf |
| `title.js`, `intro.js`, `settings.js` | Startbildschirm, Fernsehansprache vom 13.12.1981, Einstellungen |

quellen:
https://www.rmf24.pl/fakty/polska/news-archiwalne-nagranie-gen-jaruzelski-oglasza-wprowadzenie-stan,nId,1431821
https://teatrnn.pl/wydarzenia/wydarzenie/przemowienie-generala-wojciecha-jaruzelskiego/
https://dzieje.pl/aktualnosci/gen-jaruzelski-o-stanie-wojennym
https://wydarzenia.interia.pl/historia/news-wojna-polsko-jaruzelska,nId,7873361
