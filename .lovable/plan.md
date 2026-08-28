# Átvett eszköz helyes megjelenítése a leltárban

## Mit tapasztal a felhasználó

Dr. Vajkai iPhone-ja végigfutott a folyamaton, de a személyi leltárban:

- a tétel megnevezése (felhasználási cél) sorába a modellnév került, a modell sorában pedig „Egyedi eszköz” áll,
- a műszaki adatok (OS, processzor, memória, tároló) hiányoznak vagy „Nem felismert” értéket mutatnak,
- az elhelyezés sor „Elhelyezés megadása szükséges” feliratot mutat, holott személyi használatú mobil eszközről van szó.

## Ok

Az átvétel visszaigazolásakor a leltártétel a beépített eszközfelismerési listából próbálja kinyerni az adatokat (`modelKey`). A katalógusból beszerzett iPhone-hoz nincs ilyen kulcs, ezért a műszaki adatok az általános „nem felismert” sablonra esnek vissza, a modellnév pedig a megnevezés mezőbe kerül. A leltárlista a „személyi használat” eldöntéséhez szintén csak a beépített modellkategóriákat nézi.

## Megoldás

### 1. A leltártétel a katalógustételből épül fel

- Az átvételkor létrejövő leltártétel megkapja a katalógustétel azonosítóját, és a műszaki adatok a termék adatlapjáról kerülnek át (OS, verzió, CPU, RAM, tároló, feature-ök); a modellkulcsból származó adatok csak kiegészítésként (pl. magszám) jönnek.
- A megnevezés a felhasználási célt tükrözi (az eredeti igény címe, pl. „Munkahelyi okostelefon”), nem a modellnevet. Ha nincs ilyen forrás, a termékkör neve az alap.
- A modell sorban a katalógustétel neve és gyártója jelenik meg (pl. „Apple iPhone 16 256GB · Apple”).

### 2. A leltárlista megjelenítése

- A modellnév feloldása: elsődlegesen a katalógustétel, tartalékként a beépített modell-lista, és csak ezek hiányában „Egyedi eszköz”.
- A „személyi használat” / elhelyezés eldöntése a termékkör személyi használat jelöléséből (a már meglévő `needsLocationForCategory` logika szerint), a beépített mobil-kategóriák helyett.
- A műszaki adatok blokk változatlan felépítéssel, de immár feltöltött adatokkal jelenik meg.

### 3. Már létrejött tétel

A meglévő, hibásan felvett leltártétel a demó adat visszaállításával vagy az igény újrajátszásával kerül helyes állapotba; visszamenőleges adatjavítást nem végzünk.

## Technikai részletek

- `src/lib/types.ts`: `InventoryItem` új opcionális `productId` mező.
- `src/lib/store.tsx` `confirmHandoverReceipt`: `productForHandover` + `specFromProduct` használata `specForModel` helyett; `name` az igény címéből / termékkör nevéből; `productId` mentése. Ugyanez a spec kerül az eszközkataszteri tételbe is.
- `src/lib/handover-products.ts`: kis kiegészítés a megjelenítendő modellcímke előállításához (termék név + gyártó).
- `src/routes/leltar.tsx` (lista) és `src/components/personal-assets.tsx`: modellcímke és elhelyezés feloldása a katalógus alapján, a store-ból elérhető termékekkel.
- A kézi rögzítés űrlapja (beépített modell-lista) változatlan marad.
