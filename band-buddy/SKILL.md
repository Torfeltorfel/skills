---
name: "band-buddy"
description: "Band Buddy: richtet einen wöchentlichen Scout für unbekannte Live-Bands in der eigenen Stadt ein – Venues, Spotify/Notion, Startscan, Playlist, feste Übersichtsseite. Nutzen bei 'Band Buddy', 'Konzert-Scout einrichten'."
---

# Band Buddy

Findet Bands, die der Nutzer noch nicht kennt, die zu seinem Spotify-Geschmack passen und bald in seinen Lieblings-Venues spielen. Ergebnis: eine Notion-Datenbank als Speicher, eine Spotify-Playlist mit den Top 12, die Übersichtsseite "Band Buddy" (Artefakt) und eine wöchentliche geplante Aufgabe.

Antworte in der Sprache des Nutzers, knapp. Frag nur, was du nicht selbst klären kannst.

## Setup (einmalig, im Chat)

### 1. Voraussetzungen prüfen
- Spotify- und Notion-Connector müssen verbunden sein. Fehlt einer: per SearchMcpRegistry/SuggestConnectors die Verbindungskarte zeigen und warten.
- Geplante Aufgaben müssen verfügbar sein (create_trigger). Wenn nicht: sagen, dass nur manuelle Scans gehen.

### 2. Stadt und Venues
- Stadt erfragen.
- Per WebSearch 8–10 Indie-/Club-Venues mit Live-Konzerten vorschlagen (keine Arenen, keine reinen Techno-Clubs). Nutzer hakt ab und ergänzt eigene.

### 3. Programmquelle pro Venue festlegen (wichtig)
Für jede Venue:
1. Offizielle Programmseite per WebFetch lesen (oft /programm, /events, /konzerte oder die Startseite).
2. Songkick-Venue-Seite suchen (WebSearch "songkick <Venue> <Stadt>"), dann `https://www.songkick.com/venues/<ID>-<slug>/calendar` lesen. Nie lokalisierte Pfade wie /de/ verwenden, die schlagen fehl.
3. Beide vergleichen: Wie viele Konzerte in den nächsten 4 Wochen, wie weit reicht die Liste? Nimm die offizielle Seite, wenn sie deutlich mehr Konzerte zeigt (Songkick verpasst oft kleine Shows ohne Vorverkauf), sonst Songkick. Die Quelle muss mindestens 9 Wochen weit reichen.
4. Notiere Besonderheiten (sehr lange Seite → mit offset weiterlesen; Songkick mit 50 pro Seite → ?page=2).
5. Venues ohne funktionierende Quelle dem Nutzer melden; er entscheidet, ob sie rausfliegen.

### 4. Geschmacksprofil
- Spotify-Suche "my top artists" und "my most played tracks" (limit 20).
- Daraus 2–4 Geschmacks-Cluster mit Beispiel-Artists ableiten und dem Nutzer zeigen. Fragen: Was passt NICHT (Genres, die nie vorgeschlagen werden sollen)? Club-/Elektro-Genres ignorieren, falls er nur Konzerte will.

### 5. Notion-Datenbank anlegen
Titel "Band Buddy – <Stadt>". Spalten: Band (title), Spotify (url), Venue (select, eine Option pro Venue), Datum (date), Score, Gemessen, Geschätzt (number), Begründung, Ähnlich zu, Spotify-URI (text), In Playlist (checkbox), In Playlist seit (date), Status (select: aktiv, verdrängt, vorbei), Zuletzt geprüft (date). Technische Zeilen anlegen: "_PLAYLIST" (Spotify-URI und Spotify für die Playlist) und "_LOG 1", "_LOG 2", "_LOG 3" (Text in Begründung, Datum in Zuletzt geprüft). Datenbank-URL und collection://-ID notieren.

### 6. Übersichtsseite – feste Vorlage, nicht verändern
Die UI muss bei allen Nutzern identisch aussehen. Deshalb:
1. Die HTML-Vorlage unten (Abschnitt "Seiten-Vorlage") **unverändert** in eine Datei `index.html` schreiben. Nichts umgestalten, kürzen, übersetzen oder "verbessern".
2. Nur diese drei Platzhalter ersetzen, überall wo sie vorkommen: `{{CITY}}` (Stadtname), `{{COLLECTION_URL}}` (collection://-ID der Datenbank aus Schritt 5), `{{NOTION_DB_URL}}` (URL der Datenbank). Danach prüfen, dass kein `{{` mehr in der Datei steht.
3. Als neues Artefakt veröffentlichen (Titel "Band Buddy · <Stadt>", Icon "music").
4. Danach die Capability deklarieren, exakt so: `{"mcp":{"servers":[{"server":"Notion","tools":["notion-query-data-sources","notion-delete-pages"]}]}}`.
5. Seite anpinnen und dem Nutzer den Link nennen. Beim ersten Öffnen fragt die Seite einmal nach Notion-Zugriff.

Die Seite liest die Notion-DB live; der Wochenlauf muss sie nie anfassen. Ändert sich die Vorlage in einer neuen Skill-Version, Seite mit der neuen Vorlage neu veröffentlichen (gleicher Slug, gleiche drei Werte).

### 7. Startscan
Den Wochenlauf (unten) einmal mit Suchfenster heute bis heute+62 Tage ausführen. Ergebnis zeigen.

### 8. Wöchentliche Aufgabe
Mit create_trigger eine wöchentliche Aufgabe "Band Buddy – <Stadt>" anlegen (Zeitpunkt mit dem Nutzer klären, z. B. Sonntagabend). Der Prompt muss eigenständig sein: Wochenlauf unten, mit eingesetzter Stadt, DB-ID, Venue-Quellen-Liste, Geschmacks-Clustern, Ausschluss-Genres und Seiten-Link. Sagen, welche Freigabe-Einstellung die Aufgabe bekommen hat.

## Wochenlauf

1. **DB lesen.** Konzerte mit Datum < heute → Status vorbei, In Playlist aus.
2. **Geschmack.** Spotify "my top artists" + "my most played tracks". Diese Artists sind bekannt und kommen nie ins Ranking.
3. **Suchen.** Fenster: heute+56 bis heute+62 Tage (die Woche in 8 Wochen). Pro Venue genau die gespeicherte Quelle lesen. Fällt eine aus: einmal WebSearch "<Venue> <Stadt> Konzerte <Monat>", sonst als Lücke melden. Nur Konzerte, keine Partys, keine abgesagten. Bands, die schon in der DB stehen, überspringen.
4. **Score 0–10.** Spotify "artists similar to <Band>" (limit 20). Gemessen (0–6): +2 je Treffer mit Top-Artists (max 4), +1 je ähnlichem Artist in der Bibliothek (max 2). Geschätzt (0–4): Genre-Fit zu den Clustern; Ausschluss-Genres = 0. Score = Gemessen + Geschätzt, nie über 10. Ab Score 4 eintragen (Status aktiv, Spotify-Artist-Link ohne utm, Spotify-URI, Ähnlich zu mit konkreten Namen, Begründung als Halbsatz, Zuletzt geprüft = heute).
5. **Top 12.** Unter aktiv/verdrängt mit Datum ≥ heute die 12 besten (Gleichstand: früheres Datum). Diese In Playlist an, Status aktiv, In Playlist seit setzen falls leer. Rest: In Playlist aus, verdrängt.
6. **Playlist.** Nur wenn sich die Top 12 geändert haben oder keine existiert: generate_playlist "Band Buddy – <Stadt> Top 12" mit je 2 Songs genau dieser Bands. Alte Playlist mit remove_from_library entfernen, _PLAYLIST aktualisieren.
7. **Log.** Älteste _LOG-Zeile überschreiben: 1 Zeile (Woche, Treffer, Raus, Lücken), Datum heute.
8. **Meldung** per SendUserMessage, max. 6 Zeilen: Woche, Treffer oder "Kein guter Treffer", Raus, Playlist-Link falls neu, Lücken, Link zur Seite.

## Grenzen (ehrlich sagen, wenn gefragt)
- Spotify bietet keine Konzertdaten per API; die Quellen sind Websites und Songkick und können lückenhaft sein.
- Der geschätzte Score-Anteil ist Claudes Urteil.
- Jeder Wochenlauf verbraucht Kontingent des Nutzers.

## Seiten-Vorlage

Unverändert übernehmen, nur die drei Platzhalter ersetzen.

```html
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Band Buddy · {{CITY}}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  :root{
    --paper:#eef0ec; --card:#fbfcfa; --ink:#131820; --muted:#5b636e; --line:#d6dbd8;
    --signal:#e2402a; --signal-ink:#ffffff; --harbor:#1d3a5f; --soft:#e3e7e4;
    --display:"Bricolage Grotesque",ui-sans-serif,system-ui,sans-serif;
    --body:"IBM Plex Sans",ui-sans-serif,system-ui,sans-serif;
    --mono:"IBM Plex Mono",ui-monospace,monospace;
    color-scheme:light;
  }
  @media (prefers-color-scheme: dark){
    :root:not([data-theme="light"]){
      --paper:#0e1217; --card:#161b22; --ink:#ebeef0; --muted:#98a1ab; --line:#262d36;
      --signal:#ff5b43; --signal-ink:#1a0805; --harbor:#8fb3e0; --soft:#1e252e; color-scheme:dark;
    }
  }
  :root[data-theme="dark"]{
    --paper:#0e1217; --card:#161b22; --ink:#ebeef0; --muted:#98a1ab; --line:#262d36;
    --signal:#ff5b43; --signal-ink:#1a0805; --harbor:#8fb3e0; --soft:#1e252e; color-scheme:dark;
  }
  *{box-sizing:border-box}
  html,body{margin:0}
  body{background:var(--paper);color:var(--ink);font:15px/1.5 var(--body);-webkit-font-smoothing:antialiased}
  .wrap{max-width:720px;margin:0 auto;padding:24px 16px 64px;display:grid;gap:18px}
  header{display:grid;gap:6px}
  h1{font:800 clamp(34px,8vw,48px)/.95 var(--display);letter-spacing:-.03em;margin:0;text-wrap:balance}
  h1 .dot{color:var(--signal)}
  .city{font:500 12px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--signal)}
  .sub{color:var(--muted);margin:0;max-width:60ch}
  .actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:600 14px var(--body);text-decoration:none;cursor:pointer}
  .btn:hover{border-color:var(--ink)}
  .btn:focus-visible,.tab:focus-visible{outline:2px solid var(--signal);outline-offset:2px}
  .btn.primary{background:var(--signal);border-color:var(--signal);color:var(--signal-ink)}
  .btn.small{padding:6px 10px;font-size:13px;border-radius:8px}
  .btn[disabled]{opacity:.5;cursor:default}
  .scan{font-size:13px;color:var(--muted);border-left:3px solid var(--harbor);padding:2px 0 2px 10px}
  .scan b{color:var(--ink);font-weight:600}
  .spot{background:var(--ink);color:var(--paper);border-radius:16px;padding:16px 18px;display:grid;gap:4px}
  .spot .lbl{font:500 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;opacity:.7}
  .spot .who{font:800 26px/1.1 var(--display);letter-spacing:-.02em}
  .spot .where{opacity:.85}
  .tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}
  .tab{padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--muted);font:600 13px var(--body);cursor:pointer;white-space:nowrap}
  .tab[aria-selected="true"]{background:var(--ink);border-color:var(--ink);color:var(--paper)}
  .tab .n{font-family:var(--mono);font-weight:500;margin-left:4px;opacity:.75}
  .list{display:grid;gap:10px}
  .gig{display:grid;grid-template-columns:64px 1fr;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px}
  .gig.past{opacity:.72}
  .date{display:grid;justify-items:center;align-content:start;gap:0;padding-top:2px;border-right:1px solid var(--line);padding-right:12px}
  .date .wd{font:500 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
  .date .d{font:800 30px/1 var(--display);font-variant-numeric:tabular-nums}
  .date .m{font:500 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--signal)}
  .body{display:grid;gap:6px;min-width:0}
  .top{display:flex;gap:8px;align-items:baseline;justify-content:space-between;flex-wrap:wrap}
  .band{font:800 19px/1.15 var(--display);letter-spacing:-.01em;margin:0}
  .venue{font:500 12px var(--mono);color:var(--harbor);letter-spacing:.02em}
  .meter{display:flex;align-items:center;gap:8px}
  .seg{display:grid;grid-template-columns:repeat(10,1fr);gap:2px;width:120px}
  .seg i{height:6px;border-radius:2px;background:var(--soft)}
  .seg i.m{background:var(--signal)}
  .seg i.e{background:var(--harbor)}
  .score{font:500 13px var(--mono);font-variant-numeric:tabular-nums}
  .legend{font-size:12px;color:var(--muted)}
  .legend summary{cursor:pointer}
  .legend p{margin:6px 0 0;max-width:62ch}
  .legend b{color:var(--ink);font-weight:600}
  .legend .k{display:inline-block;width:8px;height:8px;border-radius:2px;margin:0 3px 0 8px;vertical-align:0}
  .why{margin:0}
  .sim{margin:0;font-size:13px;color:var(--muted)}
  .row{display:flex;gap:6px;flex-wrap:wrap;margin-top:2px}
  .pill{font:500 11px var(--mono);padding:2px 7px;border-radius:999px;background:var(--soft);color:var(--muted)}
  .note{color:var(--muted);text-align:center;padding:28px 12px;background:var(--card);border:1px dashed var(--line);border-radius:14px}
  .err{color:var(--signal);font-size:13px}
  @media (max-width:420px){ .gig{grid-template-columns:52px 1fr;gap:10px} .seg{width:96px} }
  @media (prefers-reduced-motion: reduce){ *{transition:none!important} }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <span class="city" id="city">{{CITY}}</span>
    <h1>Band Buddy<span class="dot">.</span></h1>
    <p class="sub">Bands, die du noch nicht kennst und die bald in deinen Venues spielen. Jede Woche kommen neue Konzerte dazu.</p>
  </header>
  <div class="actions" id="actions"></div>
  <div class="scan" id="scan" hidden></div>
  <div id="spot"></div>
  <div class="tabs" role="tablist" id="tabs"></div>
  <details class="legend"><summary>So entsteht der Score (0–10) <span class="k" style="background:var(--signal)"></span>gemessen <span class="k" style="background:var(--harbor)"></span>geschätzt</summary>
    <p><b>Gemessen, max. 6:</b> Spotify listet für jede Band ähnliche Artists. Je Treffer mit deinen Spotify-Top-Artists gibt es +2 (max. 4), je ähnlichem Artist in deiner Bibliothek +1 (max. 2).</p>
    <p><b>Geschätzt, max. 4:</b> Claudes Einschätzung, wie gut das Genre der ähnlichen Artists zu deinem Geschmack passt. Genres, die du ausgeschlossen hast, geben 0.</p>
    <p>Weitere Kriterien gibt es nicht. Ab 4 Punkten kommt eine Band auf die Liste, die 12 besten bilden die Playlist.</p>
  </details>
  <div class="list" id="list"><div class="note">Lade aus Notion …</div></div>
</div>
<script>
const CONFIG={
  city:"{{CITY}}",
  dataSource:"{{COLLECTION_URL}}",
  notionDb:"{{NOTION_DB_URL}}"
};
const DS=CONFIG.dataSource, NOTION_DB=CONFIG.notionDb;
const QUERY=`SELECT url,"Band","Spotify","Venue","date:Datum:start" AS datum,"Score","Gemessen","Geschätzt","Begründung","Ähnlich zu","In Playlist","date:In Playlist seit:start" AS seit,"Status","date:Zuletzt geprüft:start" AS geprueft FROM "${DS}"`;
const TABS=[{id:"top",label:"Top 12"},{id:"warte",label:"Warteliste"},{id:"vorbei",label:"Vorbei"}];
const today=new Date().toISOString().slice(0,10);
let tab="top", rows=null, playlist=null, scan=null, mcp=null, busy=new Set(), errMsg="", rowErr={}, confirm=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dt=d=>new Date(d+"T12:00:00");
const fmt=d=>d?dt(d).toLocaleDateString("de-DE",{weekday:"short",day:"numeric",month:"long"}):"";

function group(b){
  if(!b.datum||b.datum<today||b.status==="vorbei") return "vorbei";
  return b.inPlaylist?"top":"warte";
}
function parse(payload){
  const res=(payload&&payload.results)||[];
  const bands=[]; let pl=null, logs=[];
  for(const r of res){
    const name=r.Band||"";
    if(name==="_PLAYLIST"){ pl={link:r.Spotify}; continue; }
    if(name.startsWith("_LOG")){ if(r["Begründung"]&&r["Begründung"]!=="(leer)") logs.push({datum:r.geprueft,text:r["Begründung"]}); continue; }
    if(name.startsWith("_")) continue;
    bands.push({url:r.url,band:name,spotify:r.Spotify,venue:r.Venue,datum:r.datum,score:r.Score,gemessen:r.Gemessen,geschaetzt:r["Geschätzt"],begruendung:r["Begründung"],aehnlich:r["Ähnlich zu"],inPlaylist:r["In Playlist"]==="__YES__",seit:r.seit,status:r.Status});
  }
  logs.sort((a,b)=>(b.datum||"").localeCompare(a.datum||""));
  return {bands,pl,scan:logs[0]||null};
}

function meter(b){
  const m=Math.max(0,Math.min(6,b.gemessen||0)), e=Math.max(0,Math.min(4,b.geschaetzt||0));
  let s=""; for(let i=0;i<10;i++) s+=`<i class="${i<m?"m":i<m+e?"e":""}"></i>`;
  return `<div class="meter" title="Gemessen ${m} + Geschätzt ${e}"><div class="seg">${s}</div><span class="score">${esc(b.score??"–")}/10</span></div>`;
}
function gig(b){
  const g=group(b), d=b.datum?dt(b.datum):null;
  const date=d?`<div class="date"><span class="wd">${d.toLocaleDateString("de-DE",{weekday:"short"})}</span><span class="d">${d.getDate()}</span><span class="m">${d.toLocaleDateString("de-DE",{month:"short"})}</span></div>`:`<div class="date"><span class="d">–</span></div>`;
  const acts=[];
  if(b.spotify) acts.push(`<a class="btn small" href="${esc(b.spotify)}" target="_blank" rel="noopener">Auf Spotify anhören</a>`);
  if(mcp&&g!=="vorbei"){
    const dis=busy.has(b.url)?"disabled":"";
    acts.push(confirm===b.url
      ?`<button class="btn small primary" data-act="delete" data-url="${esc(b.url)}" ${dis}>Ja, entfernen</button><button class="btn small" data-act="cancel">Abbrechen</button>`
      :`<button class="btn small" data-act="ask" data-url="${esc(b.url)}" ${dis}>Passt nicht</button>`);
  }
  const seit=b.inPlaylist&&b.seit?`<span class="pill">in Playlist seit ${esc(dt(b.seit).toLocaleDateString("de-DE",{day:"numeric",month:"numeric"}))}</span>`:"";
  return `<article class="gig ${g==="vorbei"?"past":""}">
    ${date}
    <div class="body">
      <div class="top"><h2 class="band">${esc(b.band)}</h2><span class="venue">${esc(b.venue||"")}</span></div>
      ${meter(b)}
      ${b.begruendung?`<p class="why">${esc(b.begruendung)}</p>`:""}
      ${b.aehnlich?`<p class="sim">${esc(b.aehnlich)}</p>`:""}
      <div class="row">${acts.join("")}${seit}</div>
      ${rowErr[b.url]?`<div class="err">${esc(rowErr[b.url])}</div>`:""}
    </div>
  </article>`;
}
function render(){
  let a=`<a class="btn" href="${NOTION_DB}" target="_blank" rel="noopener">In Notion öffnen</a>`;
  if(playlist&&playlist.link) a=`<a class="btn primary" href="${esc(playlist.link)}" target="_blank" rel="noopener">▶ Top-12-Playlist auf Spotify</a>`+a;
  $("actions").innerHTML=a;
  if(scan){ $("scan").hidden=false; $("scan").innerHTML=`<b>Letzter Scan, ${esc(fmt(scan.datum))}:</b> ${esc(scan.text)}`; }
  if(errMsg){ $("list").innerHTML=`<div class="note">${errMsg}</div>`; $("tabs").innerHTML=""; $("spot").innerHTML=""; return; }
  if(!rows){ return; }
  const counts={}; rows.forEach(b=>{const g=group(b); counts[g]=(counts[g]||0)+1;});
  $("tabs").innerHTML=TABS.map(t=>`<button class="tab" role="tab" id="tab-${t.id}" aria-selected="${t.id===tab}" data-t="${t.id}">${t.label}<span class="n">${counts[t.id]||0}</span></button>`).join("");
  const next=rows.filter(b=>group(b)==="top").sort((x,y)=>x.datum.localeCompare(y.datum))[0];
  $("spot").innerHTML=next?`<div class="spot"><span class="lbl">Nächstes Konzert aus deinen Top 12</span><span class="who">${esc(next.band)}</span><span class="where">${esc(next.venue||"")} · ${esc(fmt(next.datum))}</span></div>`:"";
  let items=rows.filter(b=>group(b)===tab);
  if(tab==="vorbei") items.sort((x,y)=>(y.datum||"").localeCompare(x.datum||""));
  else if(tab==="top") items.sort((x,y)=>(x.datum||"").localeCompare(y.datum||""));
  else items.sort((x,y)=>(y.score||0)-(x.score||0)||(x.datum||"").localeCompare(y.datum||""));
  const empty={top:"Gerade keine Bands in den Top 12. Der nächste Wochenscan füllt die Liste.",warte:"Niemand auf der Warteliste. Hier landen Bands, die für die Top 12 zu knapp sind.",vorbei:"Noch keine vergangenen Konzerte."}[tab];
  $("list").innerHTML=items.length?items.map(gig).join(""):`<div class="note">${empty}</div>`;
}

$("tabs").addEventListener("click",e=>{const t=e.target.closest("[data-t]"); if(!t) return; tab=t.dataset.t; try{localStorage.setItem("bb-tab",tab)}catch(_){} render();});
$("list").addEventListener("click",async e=>{
  const b=e.target.closest("[data-act]"); if(!b||!mcp) return;
  const act=b.dataset.act, url=b.dataset.url;
  if(act==="ask"){ confirm=url; render(); return; }
  if(act==="cancel"){ confirm=null; render(); return; }
  if(busy.has(url)) return;
  busy.add(url); delete rowErr[url]; render();
  try{
    await mcp.callTool("Notion","notion-delete-pages",{page_ids:[url],user_confirmed:true});
    rows=rows.filter(r=>r.url!==url);
    try{ await mcp.invalidate("Notion","notion-query-data-sources"); }catch(_){}
  }catch(err){
    const c=err&&err.code;
    rowErr[url]= c==="needs_reauth"?"Notion neu verbinden (claude.ai → Einstellungen → Connectors)."
      : c==="approval_required"?"Bitte erlaube der Seite den Zugriff auf Notion und tippe noch mal."
      : c==="not_in_manifest"?"Notion ist für diese Seite nicht freigegeben."
      : "Entfernen hat nicht geklappt. Prüf in Notion, ob die Band noch drinsteht.";
  }finally{ busy.delete(url); confirm=null; render(); }
});

try{ const t=localStorage.getItem("bb-tab"); if(TABS.some(x=>x.id===t)) tab=t; }catch(_){}
render();

(async()=>{
  mcp = window.claude ? await claude.use("mcp") : null;
  if(!mcp){ errMsg="Die Notion-Verbindung ist in dieser Ansicht nicht verfügbar. Öffne die Seite angemeldet auf claude.ai."; render(); return; }
  mcp.watchTool("Notion","notion-query-data-sources",{data:{data_source_urls:[DS],query:QUERY}},ev=>{
    if(ev.type==="data"){
      const p=parse(ev.result.payload); rows=p.bands; playlist=p.pl; scan=p.scan; errMsg=""; render(); return;
    }
    const c=ev.error&&ev.error.code;
    if(["needs_reauth","server_not_connected","blocked_by_policy","not_in_manifest","approval_required"].includes(c)){ rows=null; playlist=null; scan=null; }
    if(rows) return;
    errMsg = c==="needs_reauth"?"Die Notion-Verbindung ist abgelaufen. Verbinde Notion neu unter claude.ai → Einstellungen → Connectors."
      : c==="server_not_connected"?"Notion ist nicht verbunden. Füge den Notion-Connector unter claude.ai → Einstellungen → Connectors hinzu."
      : c==="approval_required"||c==="not_in_manifest"?`Die Seite braucht deine Erlaubnis, Notion zu lesen. <button class="btn small" id="allow">Notion-Zugriff erlauben</button>`
      : c==="server_unavailable"?"Notion antwortet gerade nicht. Versuch es gleich noch mal."
      : "Die Daten aus Notion konnten nicht geladen werden.";
    render();
    const al=$("allow"); if(al) al.onclick=async()=>{ try{ const r=await mcp.callTool("Notion","notion-query-data-sources",{data:{data_source_urls:[DS],query:QUERY}}); const p=parse(r.payload); rows=p.bands; playlist=p.pl; scan=p.scan; errMsg=""; render(); }catch(_){ } };
  },{cache:{staleTime:60000,gcTime:86400000},refetchInterval:300000});
})();
</script>
</body>
</html>
```