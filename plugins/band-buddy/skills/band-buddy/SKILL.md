---
name: band-buddy
description: Band Buddy einrichten – wöchentlicher Scout für unbekannte Live-Bands in der eigenen Stadt: Venues und Programmquellen, Spotify/Notion, Startscan, Playlist, feste Übersichtsseite und Wochen-Aufgabe. Nutzen bei 'Band Buddy', 'Konzert-Scout einrichten'.
---

# Band Buddy – Setup

Richtet Band Buddy einmalig ein. Den wöchentlichen Lauf übernimmt der Skill **band-buddy-scan**; dieser Skill erzeugt nur Datenbank, Seite, Konfiguration und die geplante Aufgabe, die band-buddy-scan aufruft.

Antworte in der Sprache des Nutzers, knapp. Frag nur, was du nicht selbst klären kannst.

## 1. Voraussetzungen prüfen
- Spotify- und Notion-Connector müssen verbunden sein. Fehlt einer: per SearchMcpRegistry/SuggestConnectors die Verbindungskarte zeigen und warten.
- Der Skill band-buddy-scan muss installiert sein (sonst kann die Wochen-Aufgabe ihn nicht laden). Fehlt er: sagen und auf https://github.com/Torfeltorfel/band-buddy verweisen.
- Geplante Aufgaben müssen verfügbar sein (create_trigger). Wenn nicht: sagen, dass nur manuelle Scans gehen.

## 2. Stadt und Venues
- Stadt erfragen.
- Per WebSearch 8–10 Indie-/Club-Venues mit Live-Konzerten vorschlagen (keine Arenen, keine reinen Techno-Clubs). Nutzer hakt ab und ergänzt eigene.

## 3. Programmquelle pro Venue festlegen (wichtig)
Für jede Venue:
1. Offizielle Programmseite per WebFetch lesen (oft /programm, /events, /konzerte oder die Startseite).
2. Songkick-Venue-Seite suchen (WebSearch "songkick <Venue> <Stadt>"), dann `https://www.songkick.com/venues/<ID>-<slug>/calendar` lesen. Nie lokalisierte Pfade wie /de/, die schlagen fehl.
3. Vergleichen: Wie viele Konzerte in den nächsten 4 Wochen, wie weit reicht die Liste? Offizielle Seite nehmen, wenn sie deutlich mehr Konzerte zeigt (Songkick verpasst oft kleine Shows ohne Vorverkauf), sonst Songkick. Die Quelle muss mindestens 9 Wochen weit reichen.
4. Besonderheiten notieren (sehr lange Seite → mit offset weiterlesen; Songkick mit 50 pro Seite → ?page=2).
5. Venues ohne funktionierende Quelle melden; der Nutzer entscheidet, ob sie rausfliegen.

## 4. Geschmacksprofil
- Spotify-Suche "my top artists" und "my most played tracks" (limit 20).
- Daraus 2–4 Geschmacks-Cluster mit Beispiel-Artists ableiten und zeigen. Fragen, welche Genres nie vorgeschlagen werden sollen. Club-/Elektro-Genres ignorieren, falls er nur Konzerte will.

## 5. Notion-Datenbank anlegen
Titel "Band Buddy – <Stadt>". Spalten: Band (title), Spotify (url), Venue (select, eine Option pro Venue), Datum (date), Score, Gemessen, Geschätzt (number), Begründung, Ähnlich zu, Spotify-URI (text), In Playlist (checkbox), In Playlist seit (date), Status (select: aktiv, verdrängt, vorbei), Zuletzt geprüft (date). Technische Zeilen: "_PLAYLIST" und "_LOG 1", "_LOG 2", "_LOG 3". Datenbank-URL und collection://-ID notieren.

## 6. Übersichtsseite – feste Vorlage, nicht verändern
Die UI muss bei allen Nutzern identisch aussehen.
1. Vorlage holen: `template.html` aus dem Ordner dieses Skills. Liegt sie dort nicht (z. B. Skill ohne Zusatzdateien installiert), per Shell laden: `curl -fsSL https://raw.githubusercontent.com/Torfeltorfel/band-buddy/main/plugins/band-buddy/skills/band-buddy/template.html -o index.html`. Ohne Vorlage abbrechen und das melden; nie selbst eine Seite bauen.
2. Die Datei **unverändert** übernehmen. Nur diese Platzhalter ersetzen, überall: `{{CITY}}` (Stadt), `{{COLLECTION_URL}}` (collection://-ID aus Schritt 5), `{{NOTION_DB_URL}}` (Datenbank-URL). Danach prüfen, dass kein `{{` mehr in der Datei steht.
3. Als neues Artefakt veröffentlichen (Titel "Band Buddy · <Stadt>", Icon "music").
4. Danach die Capability exakt so deklarieren: `{"mcp":{"servers":[{"server":"Notion","tools":["notion-query-data-sources","notion-delete-pages"]}]}}`.
5. Seite anpinnen und den Link nennen. Beim ersten Öffnen fragt die Seite einmal nach Notion-Zugriff.

Bei einer neuen Vorlagen-Version die Seite mit derselben Methode neu veröffentlichen (gleicher Slug, gleiche drei Werte).

## 7. Konfiguration und Startscan
Konfiguration zusammenstellen:

```
KONFIGURATION
Stadt: <Stadt>
Datenbank: <collection://…>
Seite: <Artefakt-Link>
Venues:
- <Name>: <URL> (<Hinweis, falls nötig>)
Geschmack: <Cluster mit Beispiel-Artists>
Ausschluss: <Genres>
```

Startscan: band-buddy-scan mit dieser Konfiguration und `Fenster: heute bis heute+62 Tage` ausführen. Ergebnis zeigen.

## 8. Wöchentliche Aufgabe
Mit create_trigger eine wöchentliche Aufgabe "Band Buddy – <Stadt>" anlegen (Zeitpunkt mit dem Nutzer klären). Prompt genau so aufbauen, nichts von der Logik hineinkopieren:

```
Lade den Skill band-buddy-scan und führe den Wochenlauf aus.

<KONFIGURATION von oben>
```

So erreichen Verbesserungen an band-buddy-scan alle Nutzer ohne neue Aufgabe. Sagen, welche Freigabe-Einstellung die Aufgabe bekommen hat.

## Grenzen (ehrlich sagen, wenn gefragt)
- Spotify bietet keine Konzertdaten per API; die Quellen sind Websites und Songkick und können lückenhaft sein.
- Der geschätzte Score-Anteil ist Claudes Urteil.
- Jeder Wochenlauf verbraucht Kontingent des Nutzers.
