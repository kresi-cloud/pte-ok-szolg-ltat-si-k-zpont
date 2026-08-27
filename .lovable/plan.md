# Új személyi használatú igénylési indok: „Jelenleg nincs ilyen eszköze”

## Cél
Az `/uj-igeny` varázsló „3 Részletek” lépésénél, személyi használatú termékkörnél megjelenő „Mi az igénylés indoka?” rádiógomb-listát kiegészíteni egy új, stílusban illeszkedő válaszlehetőséggel, amely azt fejezi ki, hogy az igénylőnek jelenleg nincs ilyen eszköze.

## Változtatások

1. **Adattípus bővítése** (`src/lib/types.ts`)
   - `RequestReason` unióhoz hozzáadni: `"nincs_ilyen_eszkoz"`.
   - `REQUEST_REASON_LABELS` rekordhoz hozzáadni:  
     `nincs_ilyen_eszkoz: "Jelenleg nincs ilyen eszköze"`.

2. **Angol fordítás** (`src/lib/i18n/dictionary.ts`)
   - Hozzáadni a magyar szöveghez tartozó angol kulcsot:  
     `"Jelenleg nincs ilyen eszköze": "Currently has no such device"`.

3. **Űrlap automatikus frissítése** (`src/routes/uj-igeny.tsx`)
   - A rádiógomb-lista `Object.keys(REQUEST_REASON_LABELS)` alapján épül fel, így az új kulcs automatikusan megjelenik.
   - Ellenőrizni, hogy a `needsReplacedAsset` logika (`csere` vagy `meghibasodas`) ne reagáljon az új kulcsra, így nem kér meglévő eszköz kiválasztást.
   - A `personalDetailsOk` validáció csak nem üres `requestReason`-t vár, ami az új választással is teljesül.

## Hatáskörön kívül
Nem módosítjuk a hasonló eszköz figyelmeztetést (`SimilarAssetNotice`), a leltárba kerülési logikát vagy az igény részletes adatlapjának megjelenítését; az új indok egyszerűen egy új címke a meglévő felsorolásban.
