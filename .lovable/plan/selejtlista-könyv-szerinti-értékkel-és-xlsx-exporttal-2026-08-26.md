# Selejtlista könyv szerinti értékkel és XLSX exporttal

A gazdasági vezető által jóváhagyott selejtezési javaslatok tételei bekerülnek egy összesített **selejtlistába** a `/selejtezes` oldalon, amelyet a gazdasági vezető Excel-fájlba exportálhat.

## Selejtlista tartalma

Minden jóváhagyott javaslat minden eszközére egy sor:

| Oszlop | Forrás |
| --- | --- |
| Eszköz megnevezése | gyártó + modell (katalógus) |
| Leltári szám | eszköz leltári száma |
| Munkavállaló neve | személyhez rendelt használó, közös eszköznél a leltárfelelős (jelölve) |
| Aktiválás dátuma | üzembe helyezés dátuma |
| Kivonás dátuma | a gazdasági vezetői jóváhagyás dátuma |
| Beszerzéskori bruttó érték | eszköz bruttó beszerzési értéke |
| Bruttó könyv szerinti érték | értékcsökkenéssel számolva (lásd lent) |

A lista fejlécében: javaslat megnevezése, éve, jóváhagyó és a jóváhagyás dátuma, valamint a tételszám és a két értékoszlop összesítése.

## Értékcsökkenés számítása

Lineáris (időarányos) leírás az aktiválás napjától a kivonás napjáig, a magyar társasági adóról szóló törvény 2. melléklete szerinti kulcsokkal:

- számítástechnikai és ügyviteli gépek (notebook, asztali gép, munkaállomás, tablet, okostelefon, szerver, monitor, nyomtató, hálózati eszköz): **20%/év**
- egyéb gépek, berendezések (pl. projektor, prezentációtechnika): **14,5%/év**
- 200 000 Ft alatti egyedi beszerzési érték: **egyösszegű leírás** (könyv szerinti érték azonnal 0)

Napi arányosítás: leírt érték = bruttó érték × kulcs × (eltelt napok / 365), a könyv szerinti érték nem mehet 0 alá. A számítás módja (alkalmazott kulcs, teljesen leírt jelzés) soronként látszik a felületen és az exportban is.

## Export

- „Selejtlista exportálása (.xlsx)” gomb – csak a gazdasági vezetőnek aktív; a dékán betekintésben látja a listát, de nem exportál.
- Excel-fájl: fejléc-blokk (javaslat adatai), formázott táblázat (félkövér, keretezett fejléc, fagyasztott sor, oszlopszélességek), Ft pénznem-formátum `# ##0 "Ft"`, dátumok `ÉÉÉÉ.HH.NN`, záró összegző sor.
- Fájlnév: `selejtlista-<év>-<javaslat azonosító>.xlsx`, letöltés a böngészőből.

## Technikai részletek

- Új `src/lib/scrap-list.ts`: `depreciationRate(categoryKey)`, `bookValue(asset, activationDate, disposalDate)` és `buildScrapList(proposal, assets)` – tisztán számítási modul, tesztelhető.
- `src/routes/selejtezes.tsx`: a jóváhagyott javaslatok kártyáján az eszközlista helyett a fenti oszlopokkal rendelkező táblázat + összesítő sor + export gomb (`useViewOnly` szerint tiltva a dékánnak).
- Export a `xlsx` (SheetJS) csomaggal, kizárólag a böngészőben, dinamikus importtal, hogy ne növelje a kezdeti bundle-t. Új függőség telepítése szükséges.
- Nincs adatmodell-változás; a kivonás dátuma a javaslat `decidedAt` mezője.
