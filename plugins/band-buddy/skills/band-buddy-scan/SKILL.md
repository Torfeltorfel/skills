---
name: band-buddy-scan
description: Wöchentlicher Lauf von Band Buddy – sucht neue Konzerte in den konfigurierten Venues, bewertet die Bands gegen den Spotify-Geschmack, pflegt die Notion-Datenbank und die Top-12-Playlist. Wird von der geplanten Band-Buddy-Aufgabe mit einer Konfiguration aufgerufen.
---

# Band Buddy – Wochenlauf

Läuft meist unbeaufsichtigt als geplante Aufgabe. Die Konfiguration steht im Prompt, der diesen Skill lädt (Block `KONFIGURATION`). Fehlt ein Pflichtwert, nichts schreiben und per SendUserMessage melden, welcher fehlt. Antworte in der Sprache der Konfiguration, sehr knapp.

## Konfiguration (kommt aus dem aufrufenden Prompt)

- `Stadt`
- `Datenbank`: collection://-ID der Notion-Datenbank
- `Seite`: Link zur Band-Buddy-Seite
- `Venues`: je Zeile `Name: URL` der festgelegten Programmquelle, ggf. mit Hinweis (z. B. "lange Seite", "?page=2")
- `Geschmack`: Cluster mit Beispiel-Artists
- `Ausschluss`: Genres, die nie passen
- optional `Fenster`: Standard ist heute+56 bis heute+62 Tage

## Datenbank

Spalten: Band (title), Spotify (url), Venue (select), Datum (date), Score, Gemessen, Geschätzt (number), Begründung, Ähnlich zu, Spotify-URI (text), In Playlist (checkbox), In Playlist seit (date), Status (aktiv/verdrängt/vorbei), Zuletzt geprüft (date).
Technische Zeilen: `_PLAYLIST` (Spotify-URI + Spotify-Link der aktuellen Playlist), `_LOG 1` bis `_LOG 3` (Text in Begründung, Datum in Zuletzt geprüft). Bands, die der Nutzer aussortiert, löscht er; sie tauchen nur wieder auf, wenn sie erneut in einer Venue spielen.

## Ablauf

1. **DB lesen.** Konzerte mit Datum < heute → Status vorbei, In Playlist aus, In Playlist seit leeren.
2. **Geschmack.** Spotify-Suche "my top artists" und "my most played tracks" (limit 20). Diese Artists sind bekannt und kommen nie ins Ranking.
3. **Suchen.** Im Fenster pro Venue genau die konfigurierte Quelle per WebFetch lesen. Songkick-URLs nie mit lokalisierten Pfaden wie /de/. Lange Seiten mit offset weiterlesen; bei Songkick mit 50 Einträgen pro Seite und Fenster jenseits der letzten Datumsangabe zusätzlich `?page=2`. Fällt eine Quelle aus: einmal WebSearch "<Venue> <Stadt> Konzerte <Monat>" als Ersatz, sonst als Lücke melden. Nur Konzerte, keine Partys, keine abgesagten. Bands, die schon in der DB stehen, überspringen.
4. **Score 0–10.** Spotify-Suche "artists similar to <Band>" (limit 20).
   - Gemessen (0–6): +2 je Treffer mit den Top-Artists (max 4), +1 je ähnlichem Artist mit library_status SAVED (max 2).
   - Geschätzt (0–4): Genre-Fit zu den Geschmacks-Clustern nach Urteil; Ausschluss-Genres = 0.
   - Score = Gemessen + Geschätzt, nie über 10.
   - Ab Score 4 eintragen: Status aktiv; Spotify = `https://open.spotify.com/artist/<ID>` ohne utm; Spotify-URI = `spotify:artist:<ID>`; Ähnlich zu = konkrete Namen (z. B. "Top-Artist-Treffer: Woods; In Library: strongboi; Nachbarn: Mamalarky, Tex Crick"; bei 0 Treffern die 3 aussagekräftigsten Nachbarn); Begründung = Halbsatz; Zuletzt geprüft = heute. Unter 4 nicht eintragen.
5. **Top 12.** Unter aktiv/verdrängt mit Datum ≥ heute die 12 besten (Gleichstand: früheres Datum). Diese: In Playlist an, Status aktiv, In Playlist seit = heute falls leer. Alle anderen künftigen: In Playlist aus, In Playlist seit leeren, Status verdrängt. Merken, wer neu rein- und wer rausflog.
6. **Playlist.** Nur wenn sich die Top 12 geändert haben, die _PLAYLIST-URI leer ist oder die Playlist anders heißt als "Band Buddy – <Stadt> Top 12": mit generate_playlist "Band Buddy – <Stadt> Top 12" erstellen (je 2 Songs genau dieser Bands, keine anderen Artists). Danach alte Playlist mit remove_from_library entfernen und _PLAYLIST aktualisieren (Spotify-URI, Link `https://open.spotify.com/playlist/<ID>`).
7. **Log.** Die _LOG-Zeile mit dem ältesten oder leeren Datum überschreiben: 1 Zeile (geprüfte Woche, Treffer oder "Kein guter Treffer", Raus, Lücken), Datum heute.
8. **Meldung** per SendUserMessage, max. 6 Zeilen: geprüfte Woche (von–bis); "Treffer: Band (Venue, Datum, Score, ähnlich zu …)" oder "Kein guter Treffer"; ggf. "Raus: Band"; Playlist-Link nur wenn neu; 1 Zeile Lücken; Link zur Seite. Kein weiterer Text.
