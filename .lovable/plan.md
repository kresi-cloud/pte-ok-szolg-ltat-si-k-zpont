# Eszközmodell-választás a beszerzői katalógusból

## Probléma

Az Eszközátadás oldalon az „Eszközmodell (műszaki adatok forrása)” legördülő a beépített, rögzített eszközfelismerési listából (notebookok, asztali gépek, munkaállomások, tablet, nyomtató) dolgozik. Az átadásra váró „Apple iPhone 16 256GB (Apple)” a beszerzői termékkatalógusból származik, ezért ebben a listában nincs benne – az IT referens így nem tud modellt választani, és az átadás gombja letiltva marad.

## Megoldás

### 1. A legördülő a beszerzői katalógusból töltődik

- Az átadási tétel termékkörét a rendszer az eredeti igényből (igény → termék → termékkör) állapítja meg; ha az nem elérhető, a tervsor eszköznevéhez legjobban illeszkedő katalógustétel termékköréből.
- A legördülőben az adott termékkör **összes, a beszerző által aktuálisan beszerezhetőnek jelölt** modellje szerepel (nem csak az igényelt darab), munkavállalói kategóriától függetlenül – az IT referensnek a ténylegesen leszállított eszközt kell tudnia kiválasztani.
- Ha a termékkör nem állapítható meg, a teljes aktív katalógus jelenik meg, hogy az átadás soha ne akadjon el.
- Az alapértelmezett kiválasztás az igényelt termék.
- A műszaki adatok (OS, CPU, RAM, tároló) a kiválasztott katalógustétel adatlapjáról kerülnek át; ha a tételhez tartozik eszközfelismerési modellkulcs, az továbbra is öröklődik a leltárba.
- Az épület/helyiség kérdés a termékkör „személyi használatú” jelölése alapján jelenik meg (mobil eszköznél nem kell), a mostani merev notebook/tablet szabály helyett – így az okostelefon is helyesen viselkedik.

### 2. A beszerző csak folyamatban nem lévő eszközt vehet ki a katalógusból

- Egy termék akkor „zárolt”, ha hivatkozik rá:
  - nyitott (nem lezárt és nem visszavont) szolgáltatási igény,
  - nem teljesült beszerzési tervsor, vagy
  - le nem zárt eszközátadás.
- A katalóguskezelőben ilyenkor a Törlés gomb letiltott, és rövid magyarázat jelenik meg (pl. „2 aktív beszerzési folyamat hivatkozik rá”). Ugyanez a védelem érvényes, ha a terméket inaktívvá tennék.
- A védelem az adatrétegben is érvényesül, nem csak a gombon.

## Technikai részletek

- Új segédmodul a termékkör-feloldáshoz és az elérhető modellek listázásához (`src/lib/handover-products.ts`), a meglévő `handover-mapping.ts` mellett.
- `AssetHandover` kiegészítése opcionális `productId` mezővel; a `modelKey` visszafelé kompatibilisen megmarad.
- `src/routes/eszkozatadas.tsx`: a modell-Select a katalógusból, a spec és a `needsLocation` logika ehhez igazítva; az átadás feltételei változatlanok (modell, gyári szám, leltárkód, kötelező checklist, fénykép).
- `src/lib/store.tsx`: `markPlanItemDelivered` a tervsor `productId`-ját is átveszi; `removeProduct` / `updateProduct` (aktív → inaktív) zárolás-ellenőrzéssel.
- Új `productLockInfo` segédfüggvény (igények, tervsorok, átadások alapján), amit a katalóguskezelő UI is használ.
- `src/components/product-catalog-admin.tsx`: letiltott törlés + indoklás.
- HU/EN feliratok kiegészítése a szótárban.
