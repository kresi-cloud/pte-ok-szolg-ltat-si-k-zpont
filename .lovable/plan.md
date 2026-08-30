# Termékkatalógus bővítése: eszközkörönként +10 aktuális modell

Cél: minden termékkör kínálata bővüljön 10 további, jelenleg a piacon elérhető modellel, az ASUS ExpertBook B5 G2 adatlap részletességi szintjén, és a munkavállalói besorolás egyértelműen minőségi szinthez kötődjön.

## 1. Minőségi besorolás logikája

A három meglévő kategória ezentúl minőségi szintet jelöl, minden termékkörön belül azonos elv szerint:

- alkalmazotti = basic (belépő / mindennapi munkavégzésre elegendő konfiguráció)
- vezetoi = átlagos (erősebb, hosszabb támogatású, kényelmi funkciókkal bővített)
- felsovezetoi = prémium (csúcskategória, reprezentációs vagy nagy teljesítményigényű felhasználás)

Termékkörönként arányos elosztás: kb. 5 basic, 3 átlagos, 2 prémium modell, hogy minden szinten legyen valós választék.

## 2. Bővítendő termékkörök (körönként +10 modell)

Notebook, Asztali számítógép, Workstation, Okostelefon, Mobiltelefon, Tablet, Kijelző, Projektor, Perifériák, Nyomtató — összesen 100 új modell, a meglévők megtartása mellett.

Példa a szintezésre okostelefonnál: basic – belépő Android készülékek; átlagos – középkategóriás 5G modellek; prémium – csúcs iOS/Android zászlóshajók.

## 3. Adatlap-részletesség

Minden új modell az ASUS ExpertBook B5 G2 tétel mintáját követi, azaz kitöltött: gyártó, referenciaár (Ft), OS és pontos verzió, processzor (magszám), memória (típus/sebesség), tároló, kijelző (méret, felbontás, fényerő/frissítés), akkumulátor (ahol értelmezhető), csatlakozók, garancia, valamint 4–8 elemű feature-lista (pl. biztonsági, menedzsment, hálózati jellemzők).

Ahol egy mező nem értelmezhető (pl. monitor CPU-ja), a jelenlegi gyakorlat szerint „—” kerül bele, a kijelző/portok/feature mezők viszont mindig tartalmasak.

Minden új termék alapból igényelhető (aktív) állapotban jön létre, a beszerzői kapcsolóval bármikor kivehető.

## 4. Hatás a folyamatra

A bővítés csak a katalógust érinti: az igénylési varázsló termékválasztója, az eszközátadási modell-lista és a beszerzési tervsor automatikusan a bővült kínálatból dolgozik, meglévő igények és leltári tételek változatlanok maradnak.

## Technikai részletek

- `src/lib/product-catalog.ts`: `INITIAL_PRODUCTS` bővítése 100 új `Product` bejegyzéssel, stabil `prod-` azonosítókkal, kategóriánként csoportosítva; a fájl olvashatósága érdekében kategóriánkénti szekciókra bontva.
- A `src/lib/store.tsx` hidratálásban már működő „hiányzó seed termékek beolvasztása azonosító alapján” logika miatt a mentett demó állapotok is megkapják az új modelleket, a felhasználói módosítások megtartásával.
- Nincs típusváltozás; `Product.tier` marad a besorolás hordozója, a basic/átlagos/prémium megfeleltetés a `TIER_LABELS` mellé rövid magyarázó szövegként kerülhet a beszerzői katalógus fejlécébe.
- Ellenőrzés: `bunx tsgo --noEmit` és a `/beszerzesek` katalógusfül, valamint az `/uj-igeny` termékválasztó betöltése.
