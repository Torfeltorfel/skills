# Band Buddy

Entdecke Live-Bands, die du noch nicht kennst, die zu deinem Spotify-Geschmack passen und bald in deinen Lieblings-Venues spielen. Jede Woche kommen neue Konzerte dazu, die besten 12 landen in einer Spotify-Playlist und auf einer Übersichtsseite.

## Schnellstart

Kopiere diesen Prompt in einen neuen Claude-Chat (am besten auf claude.ai im Browser oder in der Desktop-App):

```
Richte mir bitte Band Buddy ein. Mach alles selbst und frag mich nur, was du wirklich von mir brauchst.

1. Lies die Skill-Datei https://raw.githubusercontent.com/Torfeltorfel/band-buddy/main/plugins/band-buddy/skills/band-buddy/SKILL.md und speichere sie unverändert als Skill „band-buddy“ in meinem Konto. Kannst du Skills nicht selbst speichern, erklär mir kurz, wie ich das mache, und mach danach trotzdem weiter.
2. Lies dann https://raw.githubusercontent.com/Torfeltorfel/band-buddy/main/plugins/band-buddy/skills/band-buddy/setup.md und führe das Setup Schritt für Schritt mit mir durch.
```

Das Setup fragt nach deiner Stadt und deinen Lieblings-Venues und dauert etwa 10–15 Minuten.

## Was du brauchst

- Einen bezahlten Claude-Plan mit geplanten Aufgaben
- Ein Spotify-Konto und ein Notion-Konto (Notion kostenlos reicht); Claude hilft beim Verbinden

## Installation in Claude Code

```
claude plugin marketplace add Torfeltorfel/band-buddy
claude plugin install band-buddy@band-buddy
```

Danach zu Claude sagen: **„Band Buddy einrichten“**.

## Aufbau

Ein Skill, `plugins/band-buddy/skills/band-buddy/`:

| Datei | Zweck |
|---|---|
| `SKILL.md` | Wochenlauf; erkennt am Block `KONFIGURATION`, dass er von der geplanten Aufgabe kommt |
| `setup.md` | Einmaliges Setup, wird nur bei der Einrichtung gelesen |
| `template.html` | Feste Vorlage der Übersichtsseite |

Die Wochen-Aufgabe enthält nur deine Konfiguration und lädt den Skill. Verbesserungen wirken deshalb ohne neues Setup.

## Score

0–10 = gemessen (0–6: +2 je ähnlichem Artist unter deinen Top-Artists, max. 4; +1 je ähnlichem Artist in deiner Bibliothek, max. 2) + geschätzt (0–4: Genre-Fit). Ab 4 Punkten kommt eine Band auf die Liste.

## Grenzen

Spotify bietet keine Konzertdaten per API. Die Quellen sind Venue-Websites und Songkick und können lückenhaft sein.
