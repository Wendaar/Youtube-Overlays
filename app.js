const SHEET_ID = "12lxrxxyCUwbbFqv93NMNqyhpOUoXbyml00mnNSKGjQ0";
const ASSET_BASE = "https://raw.githubusercontent.com/Wendaar/Youtube-Overlays/main/";
const FRAME = `${ASSET_BASE}PHM_Overlayer_Frame_opnening_smaller.png`;
const BRAND_LOGOS = [
  `${ASSET_BASE}26%2027%20PHM%20Cup%20Season%20Logo.png`,
  `${ASSET_BASE}PHMcup.png`,
  `${ASSET_BASE}PHMlogo.png`,
];

const app = document.querySelector("#app");
const params = new URLSearchParams(location.search);
const mode = params.get("mode") || "control";
let state = { games: [], teams: [], selectedId: params.get("game"), date: null, preview: "overlay" };

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function norm(value) {
  return String(value || "").trim().toLocaleLowerCase("cs-CZ").replace(/\s+/g, " ");
}

function cellValue(cell) {
  if (!cell) return "";
  if (cell.f !== undefined && cell.f !== null) return cell.f;
  if (cell.v === undefined || cell.v === null) return "";
  return cell.v;
}

function loadSheet(sheet) {
  return new Promise((resolve, reject) => {
    const callback = `phm_${sheet.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => finish(new Error(`List ${sheet} se nepodařilo načíst.`)), 15000);
    function finish(error, value) {
      clearTimeout(timer);
      delete window[callback];
      script.remove();
      error ? reject(error) : resolve(value);
    }
    window[callback] = (payload) => {
      if (!payload?.table) return finish(new Error(`List ${sheet} neobsahuje tabulku.`));
      const headers = payload.table.cols.map((column, index) => column.label || column.id || `col_${index}`);
      const rows = payload.table.rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, cellValue(row.c[index])])));
      finish(null, rows);
    };
    script.onerror = () => finish(new Error(`List ${sheet} se nepodařilo načíst.`));
    script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=responseHandler:${callback}&sheet=${encodeURIComponent(sheet)}`;
    document.head.appendChild(script);
  });
}

function findTeam(name) {
  if (!name) return { team: null, warning: "Název týmu zatím není vyplněný." };
  const fields = ["Nick", "Name", "Short"];
  for (const field of fields) {
    const matches = state.teams.filter((team) => norm(team[field]) === norm(name));
    if (matches.length) {
      return {
        team: matches[0],
        warning: matches.length > 1 ? `Název „${name}“ odpovídá více týmům; použito je první nalezené logo.` : "",
      };
    }
  }
  return { team: null, warning: `Pro tým „${name}“ nebylo v Teams nalezeno logo.` };
}

function gameModel(game) {
  const home = findTeam(game["Home Team"]);
  const away = findTeam(game["Away Team"]);
  return {
    ...game,
    homeLogo: home.team?.["Logo (Medium)"] || "",
    awayLogo: away.team?.["Logo (Medium)"] || "",
    warnings: [home.warning, away.warning, !game.Timekeeper ? "Není vyplněný časoměřič." : "", !game.Referee ? "Není vyplněný rozhodčí." : ""].filter(Boolean),
  };
}

function selectedGame() {
  const raw = state.games.find((game) => String(game.ID) === String(state.selectedId)) || state.games[0];
  return raw ? gameModel(raw) : null;
}

function logoMarkup(src, className, alt) {
  return src
    ? `<img class="${className}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="eager" />`
    : `<img class="${className}" src="${BRAND_LOGOS[2]}" alt="" aria-hidden="true" style="opacity:.22" crossorigin="anonymous" />`;
}

function renderStatus(message, error = false) {
  app.innerHTML = `<main class="status-screen"><div>${error ? "" : '<div class="spinner"></div>'}<h1>${escapeHtml(message)}</h1>${error ? '<p style="color:#8faeb7">Zkontrolujte veřejné sdílení Google Sheetu a obnovte stránku.</p>' : ""}</div></main>`;
}

function renderBrandRotator() {
  return `<div class="brand-rotator" aria-label="PHM Cup"><img src="${BRAND_LOGOS[0]}" alt="Logo 10. sezony PHM Cup" /><img src="${BRAND_LOGOS[1]}" alt="Logo PHM Cup" /><img src="${BRAND_LOGOS[2]}" alt="Logo PHM" /></div>`;
}

function renderOverlay(game) {
  document.body.className = "render-mode";
  const homeName = game["Home Team"] || "Bude doplněno";
  const awayName = game["Away Team"] || "Bude doplněno";
  app.innerHTML = `
    <main class="stage overlay-stage" aria-label="Opening overlay ${escapeHtml(homeName)} versus ${escapeHtml(awayName)}">
      <img class="frame-art" src="${FRAME}" alt="" aria-hidden="true" />
      ${renderBrandRotator()}
      <section class="team-block home">
        ${logoMarkup(game.homeLogo, "team-logo", `Logo ${homeName}`)}
        <div class="team-copy"><div class="team-side">Domácí</div><div class="team-name ${game["Home Team"] ? "" : "placeholder-name"}">${escapeHtml(homeName)}</div></div>
      </section>
      <section class="team-block away">
        ${logoMarkup(game.awayLogo, "team-logo", `Logo ${awayName}`)}
        <div class="team-copy"><div class="team-side">Hosté</div><div class="team-name ${game["Away Team"] ? "" : "placeholder-name"}">${escapeHtml(awayName)}</div></div>
      </section>
      <section class="info-strip">
        <div class="info-cell time-cell"><div class="info-label">Čas</div><div class="game-time">${escapeHtml(game.Time || "--:--")}</div></div>
        <div class="info-cell"><div class="info-label">Datum</div><div class="info-value">${escapeHtml(game.Date || "Bude doplněno")}</div></div>
        <div class="info-cell venue-cell"><div class="info-label">Místo</div><div class="info-value">${escapeHtml(game.Venue || "Bude doplněno")}</div><div class="info-subvalue">${escapeHtml([game.Competition, game.Group].filter(Boolean).join(" · ") || "PHM Cup")}</div></div>
        <div class="info-cell"><div class="info-label">Rozhodčí</div><div class="info-value official-value">${escapeHtml(game.Referee || "Bude doplněno")}</div></div>
        <div class="info-cell"><div class="info-label">Časoměřič</div><div class="info-value official-value">${escapeHtml(game.Timekeeper || "Bude doplněno")}</div></div>
      </section>
    </main>`;
}

function renderThumbnail(game) {
  document.body.className = "render-mode";
  document.documentElement.style.setProperty("--frame-url", `url("${FRAME}")`);
  const homeName = game["Home Team"] || "Bude doplněno";
  const awayName = game["Away Team"] || "Bude doplněno";
  app.innerHTML = `
    <main id="thumbnail" class="stage thumbnail-stage" aria-label="YouTube miniatura ${escapeHtml(homeName)} versus ${escapeHtml(awayName)}">
      <div class="thumbnail-kicker">${escapeHtml([game.Competition || "PHM Cup", game.Group].filter(Boolean).join(" · "))}</div>
      <section class="thumbnail-matchup">
        <div class="thumb-team">${logoMarkup(game.homeLogo, "thumb-logo", `Logo ${homeName}`)}<div class="thumb-name">${escapeHtml(homeName)}</div></div>
        <div class="versus">VS</div>
        <div class="thumb-team">${logoMarkup(game.awayLogo, "thumb-logo", `Logo ${awayName}`)}<div class="thumb-name">${escapeHtml(awayName)}</div></div>
      </section>
      <footer class="thumbnail-footer">
        <div><div class="thumb-time">${escapeHtml(game.Time || "--:--")}</div><div class="thumb-meta">${escapeHtml(game.Date || "Datum bude doplněno")} · ${escapeHtml(game.Venue || "Místo bude doplněno")}</div></div>
        <img class="thumb-brand" src="${BRAND_LOGOS[0]}" alt="10. sezona PHM Cup" crossorigin="anonymous" />
      </footer>
    </main>
    ${params.get("clean") === "1" ? "" : '<button class="download-floating" id="download-thumbnail">Stáhnout PNG</button>'}`;
  document.querySelector("#download-thumbnail")?.addEventListener("click", downloadThumbnail);
}

async function downloadThumbnail() {
  const button = document.querySelector("#download-thumbnail");
  const original = button.textContent;
  button.textContent = "Připravuji…";
  button.disabled = true;
  try {
    if (!window.html2canvas) throw new Error("Nástroj pro export není načtený.");
    const canvas = await html2canvas(document.querySelector("#thumbnail"), { width: innerWidth, height: innerHeight, scale: 1280 / innerWidth, useCORS: true, backgroundColor: "#061115", logging: false });
    const link = document.createElement("a");
    link.download = `PHM-${norm(selectedGame()?.Name || "thumbnail").replace(/[^a-z0-9]+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (error) {
    alert(`Miniaturu se nepodařilo stáhnout: ${error.message}`);
  } finally {
    button.textContent = original;
    button.disabled = false;
  }
}

function renderControl() {
  document.body.className = "";
  const dates = [...new Set(state.games.map((game) => game.Date || "Bez data"))];
  state.date ||= dates[0];
  const dayGames = state.games.filter((game) => (game.Date || "Bez data") === state.date);
  if (!dayGames.some((game) => String(game.ID) === String(state.selectedId))) state.selectedId = dayGames[0]?.ID || state.games[0]?.ID;
  const game = selectedGame();
  const previewUrl = `index.html?mode=${state.preview}&game=${encodeURIComponent(game.ID)}${state.preview === "thumbnail" ? "&clean=1" : ""}`;
  const obsUrl = new URL(`index.html?mode=overlay&game=${encodeURIComponent(game.ID)}`, location.href).href;
  app.innerHTML = `
    <div class="control-shell">
      <header class="control-header">
        <div class="brand-lockup"><img class="brand-mark" src="${BRAND_LOGOS[1]}" alt="PHM Cup" /><div><p class="eyebrow">Broadcast graphics</p><h1>Opening Studio</h1></div></div>
        <div class="live-chip">Data z Google Sheetu</div>
      </header>
      <div class="control-grid">
        <aside class="match-panel">
          <div class="panel-title"><h2>Vyber zápas</h2><span class="count">${state.games.length} zápasů</span></div>
          <div class="date-tabs">${dates.map((date) => `<button class="date-tab ${date === state.date ? "active" : ""}" data-date="${escapeHtml(date)}">${escapeHtml(date)}</button>`).join("")}</div>
          <div class="match-list">${dayGames.map((item) => { const model = gameModel(item); return `<button class="match-card ${String(item.ID) === String(game.ID) ? "active" : ""}" data-game="${escapeHtml(item.ID)}"><div class="match-card-top"><span>${escapeHtml(item.Time || "--:--")}</span><span>${escapeHtml(item.Group || "PHM Cup")}${model.warnings.length ? '<i class="warn-dot" title="Chybějící nebo nejednoznačná data"></i>' : ""}</span></div><div class="match-card-teams">${escapeHtml(item["Home Team"] || "Bude doplněno")} — ${escapeHtml(item["Away Team"] || "Bude doplněno")}</div><div class="match-card-venue">${escapeHtml(item.Venue || "Místo bude doplněno")}</div></button>`; }).join("")}</div>
        </aside>
        <main class="workspace">
          <div class="workspace-toolbar">
            <div class="view-switch"><button class="view-button ${state.preview === "overlay" ? "active" : ""}" data-view="overlay">OBS overlay</button><button class="view-button ${state.preview === "thumbnail" ? "active" : ""}" data-view="thumbnail">YouTube miniatura</button></div>
            <div class="actions"><button class="button" id="copy-url">Kopírovat OBS URL</button><button class="button" id="open-view">Otevřít čistý náhled</button>${state.preview === "thumbnail" ? '<button class="button primary" id="download-from-control">Stáhnout PNG</button>' : ""}</div>
          </div>
          <div class="obs-url-bar"><div><span>Unikátní OBS URL vybraného zápasu</span><strong>${escapeHtml(game.Name || game.ID)}</strong></div><input id="current-obs-url" readonly value="${escapeHtml(obsUrl)}" aria-label="Unikátní OBS URL vybraného zápasu" /></div>
          <section class="preview-card">
            <div class="preview-meta"><span>${escapeHtml(game.Name || `${game["Home Team"] || "?"} vs ${game["Away Team"] || "?"}`)}</span><span>${state.preview === "overlay" ? "1920 × 1080 · transparentní" : "1280 × 720"}</span></div>
            <div class="preview-frame ${state.preview === "overlay" ? "overlay-preview" : ""}"><iframe id="preview" title="Náhled grafiky" src="${previewUrl}"></iframe></div>
            ${game.warnings.length ? `<div class="data-alert"><strong>Upozornění k datům:</strong> ${game.warnings.map(escapeHtml).join(" ")}</div>` : ""}
          </section>
        </main>
      </div>
    </div>`;
  wireControl();
}

function wireControl() {
  document.querySelectorAll("[data-date]").forEach((button) => button.addEventListener("click", () => { state.date = button.dataset.date; renderControl(); }));
  document.querySelectorAll("[data-game]").forEach((button) => button.addEventListener("click", () => { state.selectedId = button.dataset.game; const controlUrl = new URL(location.href); controlUrl.searchParams.set("game", state.selectedId); history.replaceState(null, "", controlUrl); renderControl(); }));
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { state.preview = button.dataset.view; renderControl(); }));
  document.querySelector("#open-view")?.addEventListener("click", () => { const game = selectedGame(); window.open(`index.html?mode=${state.preview}&game=${encodeURIComponent(game.ID)}`, "_blank", "noopener"); });
  document.querySelector("#copy-url")?.addEventListener("click", async () => { const field = document.querySelector("#current-obs-url"); const button = document.querySelector("#copy-url"); try { await navigator.clipboard.writeText(field.value); button.textContent = "URL zkopírována"; } catch { field.focus(); field.select(); document.execCommand("copy"); button.textContent = "URL označena"; } setTimeout(() => button.textContent = "Kopírovat OBS URL", 1400); });
  document.querySelector("#download-from-control")?.addEventListener("click", () => { const frame = document.querySelector("#preview"); frame.contentWindow.downloadThumbnail?.(); });
}

async function refreshRenderMode() {
  try {
    [state.games, state.teams] = await Promise.all([loadSheet("Games"), loadSheet("Teams")]);
    const game = selectedGame();
    if (!game) return;
    if (mode === "overlay") renderOverlay(game);
    if (mode === "thumbnail") renderThumbnail(game);
  } catch (error) {
    console.warn("Automatická aktualizace dat se nezdařila.", error);
  }
}

async function start() {
  renderStatus("Načítám zápasy…");
  try {
    [state.games, state.teams] = await Promise.all([loadSheet("Games"), loadSheet("Teams")]);
    if (!state.games.length) throw new Error("List Games je prázdný.");
    state.selectedId ||= state.games[0].ID;
    const game = selectedGame();
    if (!game) throw new Error("Vybraný zápas nebyl nalezen.");
    if (mode === "overlay") renderOverlay(game);
    else if (mode === "thumbnail") renderThumbnail(game);
    else renderControl();
    if (mode === "overlay" || mode === "thumbnail") setInterval(refreshRenderMode, 60000);
  } catch (error) {
    console.error(error);
    renderStatus(error.message || "Data se nepodařilo načíst.", true);
  }
}

start();
