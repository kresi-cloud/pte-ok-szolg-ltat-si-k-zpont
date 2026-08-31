# Eszköz azonnali megjelenése a leltárban az átadásnál

## Probléma

A kari IT referens az „Átadás az igénylőnek” gomb megnyomásakor a handover `atadva` állapotba kerül, de a leltártétel csak akkor jön létre (`confirmHandoverReceipt`), amikor az igénylő visszaigazolja az átvételt. Addig az eszköz nem a leltárban, hanem csak egy külön „Átvételre váró eszközök” blokkban látszik — a visszajelzési lánc így nem teljes.

## Megoldás

A leltártétel már az átadás pillanatában létrejön „átvételre vár” státusszal, és az igénylő visszaigazolása csak a státuszt váltja jóváhagyottra.

### Lépések

1. **Új leltárstátusz** (`src/lib/types.ts`)
   - `InventoryStatus` bővítése: `"atvetelre_var"` (címke: „Átvételre vár”).

2. **Leltártétel létrehozása átadáskor** (`src/lib/store.tsx` – `handOverToUser`)
   - Az átadáskor (`Átadás az igénylőnek` gomb) azonnal létrejön az `InventoryItem` a címzett leltárába, `atvetelre_var` státusszal, katalógus-termékhez kötve (meglévő `productForHandover` / `specFromProduct` logika áthelyezve ide).
   - A handover kap egy `inventoryItemId` hivatkozást (típusbővítés a `Handover` interfészben).

3. **Visszaigazolás = státuszváltás** (`confirmHandoverReceipt`)
   - Ha a handoverhez már tartozik leltártétel, annak státusza `atvetelre_var` → `jovahagyva`, a handover `atvetel_igazolva` lesz, megtörténik a kérés lezárása és az értesítés.
   - Visszafelé-kompatibilitás: régi, leltártétel nélküli `atadva` handovereknél a jelenlegi „létrehozás visszaigazoláskor” ág megmarad fallbackként.

4. **Leltár oldal** (`src/routes/leltar.tsx`)
   - Az „Átvételre váró eszközök” blokk az eddigi handover-lista helyett/mellett a leltártétel-kártyát mutatja (modell, gyári szám, PTE leltárkód), rajta az „Átvétel visszaigazolása” gombbal.
   - A fő leltártáblában az `atvetelre_var` tételek jellegzetes sárga státuszchippel jelennek meg.
   - Dublikációkizárás: ha a tétel már leltárban van, a külön blokk ne jelenjen meg kétszer.

5. **Státusz megjelenítés egyéb helyeken**
   - `INVENTORY_STATUS_LABELS` és minden státusz-szűrő/összesítő (pl. vezetői dashboard, leltárszámok) kiegészítése az `atvetelre_var` értékkel, hogy ne essen ki semmilyen nézetből.

## Érintett fájlok

- `src/lib/types.ts` — új státusz + `Handover.inventoryItemId`
- `src/lib/store.tsx` — `handOverToUser`, `confirmHandoverReceipt`
- `src/routes/leltar.tsx` — átvételre váró blokk és státuszchip
- esetleges státusz-felhasználó nézetek (dashboard összesítők)

## Ellenőrzés

Playwright-tal végigjátszva: referens „Átadás az igénylőnek” → az eszköz azonnal megjelenik Dr. Hollósy leltárában „Átvételre vár” státusszal → „Átvétel visszaigazolása” → státusz „Jóváhagyva”, a kérés lezárul.
