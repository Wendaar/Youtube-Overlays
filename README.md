# HMS Opening Studio · PHM / EUCHL

Předzápasová grafika pro OBS a YouTube miniatura nyní standardně čtou **HMS API**.
Vyberte PHM/EUCHL nebo vložte odkaz na zápas v HMS. Ovládání nabízí dnešní,
zítřejší, příští a minulé zápasy (prvních 20; konkrétní zápas lze vždy otevřít ID).
Každý zápas má vlastní OBS URL s organizací i Game ID, takže více stadionů může
běžet souběžně. Samotný overlay nemá ovládání ani navigaci.

## Datové napojení

Prohlížeč čte `/api/broadcast` v HMS Insights. Při hostování na GitHub Pages
používá `https://hms-insights-five.vercel.app/api/broadcast`; při hostování pod
`/broadcast/` používá stejnojmenný endpoint na stejné doméně.
Serverová část je v `Wendaar/HMS-Insights/src/web/broadcast-handler.js`.
Backend musí být nasazený před přepnutím GitHub Pages na tuto verzi.

HMS veřejné API vrací CORS pro vlastní HMS web; přímý klientský fetch z GitHub
Pages proto není spolehlivé řešení. Server používá vlastní připojení organizace,
ověřuje gameId i organizationId a vrací jen předzápasová sportovní pole. Token
není součástí prohlížeče, OBS URL ani tohoto repozitáře. Žádné zápisy do HMS/DB.

Příklad pro EUCHL:

`index.html?org=EUCHL&game=6C02DF50-CE27-11F1-A5F0-6320901B5AD5`

OBS URL:

`index.html?mode=overlay&org=EUCHL&game=6C02DF50-CE27-11F1-A5F0-6320901B5AD5&source=hms`

V OBS použijte Browser Source **1920 × 1080**, vypněte vlastní pozadí a zapněte
obnovení při aktivaci. Přihlašovací ani API klíč se do OBS nezadává.
Jde o předzápasovou vrstvu; živé skóre a běžící časomíra nejsou touto verzí zavedené.

## Vzhled a odolnost

- PHM si ponechává původní PNG podklad a rotující značky.
- EUCHL používá neutrální SVG rám ve stejném rozvržení, bez PHM značek; loga týmů
  a případné ligové logo přicházejí z HMS. Chybějící ligové logo zastoupí text EUCHL.
- Lokální Barlow Condensed má přibalenou OFL licenci a českou znakovou sadu.
- Datum a čas se přebírají jako lokální údaje HMS (Europe/Prague), neposouvají se UTC.
- Chybějící rozhodčí/časoměřič zůstávají označené „Bude doplněno“.
- Úspěšně otevřený overlay obnovuje data po 60 s. Nezměněná grafika se nepřekresluje.
- Při krátkém výpadku zůstane poslední ověřený stav a opakuje se načtení po 15 s.
  Po 10 minutách bez úspěchu overlay zmizí. Při první chybě zůstane průhledný;
  ve vysílání se neukáže chybová stránka ani jiný náhradní zápas.

## Vývoj a ověření

Node 20+: `npm start` (port 3100) a `npm test`. Klientské testy ověřují HMS odkazy,
organizaci a Game ID, bezpečné obrázky a OBS URL. Integrační browser scénář a
serverové testy jsou v HMS Insights (`scripts/broadcast-browser.mjs`,
`test/broadcast.test.js`). Čtyři frontendové soubory, fonty a licence se tam kopírují
pomocí `node scripts/sync-broadcast.js cesta/k/Youtube-Overlays` a hostují pod
`/broadcast/index.html`. Zdrojem frontendových změn zůstává tento repozitář.

## Původní PHM režim ze Sheetu

Níže je původní popis. Pro staré řádky/ID použijte **výslovně** `source=sheet`,
například `index.html?source=sheet&org=PHM&mode=overlay&game=STARE_ID`.
HMS režim při chybě nikdy automaticky nepřepíná na Sheet.

Statická webová aplikace pro GitHub Pages. Načítá zápasy z listu `Games`, hledá loga podle `Home Team` a `Away Team` v listu `Teams` a používá sloupec `Logo (Medium)`.

## Co nahrát do repozitáře

Do kořene repozitáře `Youtube-Overlays` patří:

- `index.html`
- `styles.css`
- `app.js`
- `og.png`
- stávající PNG podklady (`PHM_Overlayer_Frame_opnening_smaller.png`, `PHMlogo.png`, `PHMcup.png`, `26 27 PHM Cup Season Logo.png`)

## Zapnutí GitHub Pages

V repozitáři otevřete `Settings → Pages`, jako zdroj vyberte `Deploy from a branch`, větev `main` a složku `/ (root)`. Po zveřejnění bude ovládání na adrese:

`https://wendaar.github.io/Youtube-Overlays/`

## OBS

V ovládání vyberte zápas a použijte `Kopírovat OBS URL`. V OBS přidejte `Browser Source`:

- šířka `1920`
- výška `1080`
- vypnout vlastní pozadí
- doporučeno zapnout obnovu zdroje při aktivaci

Adresa overlaye má tvar:

`https://wendaar.github.io/Youtube-Overlays/index.html?mode=overlay&game=GAME_ID`

Po kliknutí na zápas se přímo v ovládání zobrazí jeho aktuální unikátní OBS URL. Pro tři stadiony tedy vyberte postupně tři zápasy a každou adresu zkopírujte do jiného Browser Source v OBS.

## YouTube miniatura

V ovládání přepněte na `YouTube miniatura`. Čistý náhled má poměr 16:9 a tlačítko `Stáhnout PNG` vytvoří soubor 1280 × 720.

## Chování dat

- Prázdné hodnoty se zobrazí jako `Bude doplněno`.
- Celý obsah buněk `Referee` a `Timekeeper` zůstává zachovaný, takže může obsahovat více jmen.
- Pokud stejnému názvu odpovídá více týmů, použije se první shoda a ovládání zobrazí upozornění.
- Loga v opening overlayi se střídají každých pět sekund. Při systémově vypnutých animacích zůstane zobrazené první logo.
- Otevřený overlay a miniatura si každých 60 sekund znovu načtou data ze Sheetu.
