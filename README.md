# Band Buddy

Entdecke Live-Bands, die du noch nicht kennst, die zu deinem Spotify-Geschmack passen und bald in deinen Lieblings-Venues spielen. Jede Woche kommen neue Konzerte dazu, die besten 12 landen in einer Spotify-Playlist und auf einer Übersichtsseite.

## Was du brauchst

- Claude mit geplanten Aufgaben
- Spotify- und Notion-Connector

## Installation

Claude Code:

```
claude plugin marketplace add Torfeltorfel/band-buddy
claude plugin install band-buddy@band-buddy
```

claude.ai: die beiden Ordner unter `plugins/band-buddy/skills/` als Skills hinzufügen.

Danach zu Claude sagen: **„Band Buddy einrichten“**.

## Aufbau

| Skill | Zweck |
|---|---|
| `band-buddy` | Einmaliges Setup: Stadt, Venues und Programmquellen, Geschmack, Notion-Datenbank, Übersichtsseite, Wochen-Aufgabe |
| `band-buddy-scan` | Wöchentlicher Lauf, von der geplanten Aufgabe mit deiner Konfiguration aufgerufen |
| `template.html` | Feste Vorlage der Übersichtsseite |

Die Wochen-Aufgabe enthält nur deine Konfiguration und lädt `band-buddy-scan`. Verbesserungen am Scan wirken deshalb ohne neues Setup.

## Score

0–10 = gemessen (0–6: +2 je ähnlichem Artist unter deinen Top-Artists, max. 4; +1 je ähnlichem Artist in deiner Bibliothek, max. 2) + geschätzt (0–4: Genre-Fit). Ab 4 Punkten kommt eine Band auf die Liste.

## Grenzen

Spotify bietet keine Konzertdaten per API. Die Quellen sind Venue-Websites und Songkick und können lückenhaft sein.
