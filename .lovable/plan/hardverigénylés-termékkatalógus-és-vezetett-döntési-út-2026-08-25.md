# Hardverigénylés: termékkatalógus és vezetett döntési út

Cél: a hardverigénylés ne egy általános „Mit szeretne elérni?” kérdéssel induljon, hanem egy konkrét, termékalapú döntési úton vezesse végig az igénylőt. A beszerző szabadon kezeli a termékköröket és a modelleket, és három munkavállalói kategória szerint teszi elérhetővé őket.

## 1. Termékkatalógus (beszerzői kezelésben)

Két új, szerkeszthető adatréteg:

- **Termékkör** (kategória): pl. okostelefon, mobiltelefon, notebook, workstation, asztali számítógép, monitor/kijelző, projektor, perifériák. Mezői: név, rövid leírás, ikon/besorolás, aktív/inaktív.
- **Termék (modell)**: egy termékkörhöz tartozik, pl. „Xiaomi Redmi Note 15 Pro 5G 256GB / 8GB RAM”. Mezői: megnevezés, gyártó, technikai adatlap (OS és verzió, processzor, memória, tároló, kijelző, akkumulátor, csatlakozók, speciális feature-ök listája), referenciaár, megjegyzés, elérhetőségi szint, aktív/inaktív.

A beszerző új „Termékkatalógus” munkafelületen (a beszerzői oldal új füle) hozhat létre, módosíthat és törölhet termékköröket és modelleket. Használatban lévő tétel törlésekor figyelmeztetés + inaktiválás javaslata, hogy a korábbi igények ne sérüljenek.

## 2. Munkavállalói kategóriák és láthatóság

Három szint: **alkalmazotti**, **vezetői**, **felsővezetői**.

- A beszerző minden terméknél megadja, melyik szinttől érhető el.
- A felhasználók besorolása a jogosultságkezelésben történik (admin/dékáni betekintés a meglévő szabályok szerint); minden felhasználónak pontosan egy besorolása van, alapértelmezés: alkalmazotti.
- Láthatósági szabály: alkalmazotti → csak alkalmazotti csomag; vezetői → alkalmazotti + vezetői; felsővezetői → minden termék.
- Az igénylési felületen **semmilyen utalás nem jelenik meg** a besorolásra: nincs címke, nincs „vezetői csomag” felirat, nincs zárolt/kiszürkített tétel — a nem elérhető termékek egyszerűen nem szerepelnek a listában.

## 3. Vezetett igénylési út (hardver)

A hardver domain választása után a varázsló új lépéssorra vált:

```text
1. Termékkör kiválasztása   (kártyás választó, csak a látható körök)
2. Termék kiválasztása      (a körhöz tartozó, számára elérhető modellek)
3. Technikai adatlap        (a választott termék teljes specifikációja, mennyiség)
4. Indoklás és részletek    (cél, felhasználók, határidő, meglévő eszköz cseréje)
5. Összegzés és beküldés
```

- A termék kiválasztásakor azonnal megjelenik a **technikai adatlap** (OS/verzió, CPU, RAM, tároló, kijelző, feature-ök, referenciaár tájékoztató jelleggel).
- Ha egy termékkörben nincs számára elérhető modell, a kör nem jelenik meg; ha egyik sem érhető el, egyedi („nem katalógusból”) igény adható be szöveges indoklással.
- Az igény címe és rövid leírása automatikusan generálódik a termékből, de szerkeszthető marad.
- A többi terület (szoftver, web, digitalizáció) a jelenlegi folyamaton marad; a kezdőlapon a hardver csempe közvetlenül az új döntési útra visz.

## 4. Kapcsolódás a meglévő folyamathoz

- A beküldött igény megőrzi a választott termékkör- és termékazonosítót, így a jóváhagyási lánc és a beszerzési tervsor-generálás a konkrét modellel és annak referenciaárával dolgozik (a jelenlegi kulcsszavas találgatás helyett).
- Az átadás-átvétel és a személyi leltárba kerülés a termék technikai adatlapját veszi át, így a leltár automatikusan pontos műszaki adatokat kap.

## Technikai részletek

- `src/lib/types.ts`: `ProductCategory`, `Product`, `AvailabilityTier = "alkalmazotti" | "vezetoi" | "felsovezetoi"`, `User.employeeTier`; `ServiceRequest` bővítés `productCategoryId` / `productId` / `quantity` mezőkkel.
- Új `src/lib/product-catalog.ts`: kezdeti termékkörök és modellek (a meglévő `HARDWARE_STANDARDS` és `HARDWARE_MODELS` adataiból származtatva), plusz `visibleProductsFor(user)` szűrő.
- `src/lib/store.tsx`: `productCategories`, `products` állapot + CRUD akciók (beszerző jogosultsághoz kötve, auditnaplózással), `setUserTier` akció.
- `src/routes/beszerzesek.tsx`: új „Termékkatalógus” fül a meglévő `fieldset`/betekintési logikával.
- `src/routes/uj-igeny.tsx`: hardver ág külön lépéssorral és adatlap-panellel.
- `src/routes/jogosultsagok.tsx`: munkavállalói besorolás választó felhasználónként.
- `src/lib/request-procurement.ts`: ha van `productId`, abból képezze a tervsort a kulcsszavas szabályok helyett.
- Az adatok továbbra is a demó store-ban / localStorage-ban élnek, backend nem szükséges.
