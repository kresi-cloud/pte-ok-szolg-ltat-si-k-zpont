# Eseti beszerzések: a „Művelet” oszlop felülvizsgálata és tömeges azonnali besorolás

## Mai állapot
Az „Eseti beszerzések” táblában a „Művelet” oszlop tartalma kizárólag a beszerzőnek jelenik meg
(„Átadás eszközmenedzsernek”, „Beszerzés indítása”, „Beérkezett – átadásra”). Gazdasági vezetőként
és eszközmenedzserként ez az oszlop mindig üres, miközben a tényleges műveleteik (azonnali /
negyedéves bontás, tervblokk) a külön „Tervblokk” oszlopban vannak. A tömeges átütemezés csak
negyedéves célblokkot kínál, azonnalit nem.

## Mit változtatunk

### 1. Üres oszlop megszüntetése
- A „Művelet” oszlop csak akkor jelenik meg, ha az adott szerepnek van benne elérhető gombja.
  Gazdasági vezetőnél és eszközmenedzsernél így nem marad üres oszlop.
- Ha egy tételnél a beszerzőnek sincs már teendője, a cella helyett rövid állapotszöveg jelenik meg
  (pl. „Átadási folyamatban a kari IT referensnél”, „Teljesült”), üres cella helyett.

### 2. A blokk (ütemezés) oszlop tisztázása
- A „Tervblokk” oszlop neve „Ütemezés” lesz, és egyértelmű címkékkel jelzi a két vezérlőt:
  - Bontás: Azonnali / Negyedéves terv
  - Célnegyedév: csak akkor aktív (választható), ha a tétel negyedéves bontású; azonnali tételnél
    kikapcsolt állapotban, „Azonnali – nincs tervnegyedév” jelzéssel.
- A soron látszik az aktuális besorolás szöveggel is (pl. „Azonnali” vagy „2027. II. negyedév”),
  hogy a blokk funkciója olvasás közben is érthető legyen.

### 3. Tömeges művelet: azonnali beszerzés is
- A tömeges legördülőben a negyedéves blokkok elé bekerül az „Azonnali beszerzés” opció.
- Azonnali választásnál a kijelölt tételek bontása azonnalira vált (tervnegyedév marad technikai
  értékként, de a tétel az „Azonnali beszerzési csomag” ciklusba kerül).
- Negyedév választásnál a kijelölt tételek negyedéves bontásba kerülnek és a célnegyedévbe
  ütemeződnek – vagyis a tömeges művelet mindkét irányban működik.
- A visszajelző üzenet a választott célt nevezi meg.

## Technikai részletek
- `src/routes/beszerzesek.tsx`:
  - `ItemRow` / `ItemsTable`: új `showActions` számítás (szerep + tételállapot alapján), a
    „Művelet” fejléc és cella feltételes megjelenítése; az ütemező oszlop fejlécének átnevezése,
    a negyedév-select letiltása azonnali bontásnál.
  - Tömeges blokk: `bulkBlock` értékkészlete kiegészül egy `"azonnali"` kulccsal; az akció
    `store.setPlanItemTiming(id, "azonnali")`, illetve negyedév esetén
    `setPlanItemTiming(id, "negyedeves")` + `reschedulePlanItem(...)` hívást futtat.
- Nincs adatmodell-változás; a store meglévő műveleteit használjuk.
- `src/lib/i18n/dictionary.ts`: az új/átnevezett magyar szövegek angol fordítása.
