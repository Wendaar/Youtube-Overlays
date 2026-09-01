# PHM Cup Broadcast Graphics

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
