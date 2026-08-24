# Hardver-beszerzési folyamat: igényleadástól az átvételig

Cél: a hardvereszköz-igény teljes életútja végigjátszható és tesztelt legyen, kiegészítve a **helyi IT referens** szereppel, aki a beszerzett eszközt telepítve, beállítva átadja az igénylőnek — és az átvétellel az eszköz automatikusan bekerül az igénylő személyi leltárába.

## A lánc, amit kiépítünk

```text
Igénylő            új hardverigény (varázsló)
   -> Szervezeti jóváhagyó / szolgáltatásgazda   igény jóváhagyás
   -> Beszerző        átadás tervezésre
   -> IT eszközmenedzser   azonnali / negyedéves tervsorba sorolás, beküldés
   -> Gazdasági vezető     ellenőrzés, módosítás, továbbítás
   -> Dékán                jóváhagyás
   -> Beszerző             beszerzés indítása -> "beérkezett"
   -> Helyi IT referens    telepítés, beállítás, átadás (átadás-átvétel)
   -> Igénylő              átvétel visszaigazolása -> személyi leltár tétel jön létre
```

## Mi épül meg

### 1. Új szerep: helyi IT referens (`it_referens`)
- Szerepkulcs, címke és leírás a szerepnyilvántartásban, superuser által kiosztható.
- Demó felhasználó (ritkább magyar vezetéknév + kezdőbetű), szervezeti egységhez rendelve; a demó felhasználóváltó listába is bekerül.
- Menüben új „Eszközátadás” munkatér, csak referensnek (és eszközmenedzsernek/dékánnak rálátásra).

### 2. Új szakasz: kiszállítás és átadás
Új adatentitás (`AssetHandover`) a beszerzési tervsorhoz és az eredeti igényhez kötve, állapotai:
`beerkezett` -> `elokeszites_alatt` (telepítés/konfiguráció) -> `atadasra_kesz` -> `atadva` -> `atvetel_igazolva`.
Tartalmazza: eszköz modell/standard, gyári szám, PTE leltárkód, átvevő, telepített OS/verzió, megjegyzés, minden lépés időbélyeggel és felelőssel.

### 3. Eszközátadás munkatér (új oldal)
A referens itt látja a hozzá tartozó, beszerzésből beérkezett tételeket, rögzíti a gyári számot és a leltárkódot, jelöli a telepítés készültségét, majd „Átadás az igénylőnek” gombbal lezárja.

### 4. Igénylői átvétel + automatikus leltárba kerülés
- Az igénylő a saját igény oldalán és a „Személyi leltár” oldalon látja az átvételre váró eszközt, és visszaigazolja az átvételt.
- Az átvétel visszaigazolásakor a rendszer automatikusan létrehoz egy személyi leltártételt (hardver, gyári szám, leltárkód, automatikus műszaki adatok a modellkatalógusból, nem mobil eszköznél épület/helyiség), **már jóváhagyott állapotban** — nem kell újra admin jóváhagyás, mert az átadást intézményi folyamat igazolja.
- Az eredeti szolgáltatási igény állapota „teljesült”-re vált, a tervsor státusza „teljesült” lesz.

### 5. Átláthatóság és audit
- Minden lépés bekerül az audit-naplóba és értesítést generál az érintettnek.
- Az igény részletező oldalán megjelenik a teljes beszerzési idővonal (igény -> terv -> jóváhagyások -> beszerzés -> átadás -> átvétel), így az igénylő és a vezetők végig látják, hol tart az ügy.

## Tesztelés (Playwright, végigjátszott forgatókönyv)
Egyetlen folyamatteszt, amely szerepenként végigmegy a láncon és képernyőképeket készít:
1. igénylő: notebook-igény beadása,
2. jóváhagyó: jóváhagyás,
3. beszerző: átadás eszközmenedzsernek,
4. eszközmenedzser: negyedéves tervsorba sorolás + beküldés,
5. gazdasági vezető: ellenőrzés + továbbítás,
6. dékán: jóváhagyás,
7. beszerző: végrehajtás indítása, beérkezés jelölése,
8. IT referens: gyári szám/leltárkód rögzítése, telepítés kész, átadás,
9. igénylő: átvétel visszaigazolása, majd ellenőrzés, hogy az eszköz megjelenik a személyi leltárában a helyes műszaki adatokkal.
A talált hibákat javítjuk, végül build- és típusellenőrzés.

## Technikai részletek
- `src/lib/types.ts`: `RoleKey` bővítés (`it_referens`), `AssetHandover` típus és állapotok.
- `src/lib/seed.ts`: referens demó felhasználó; `src/lib/demo-users.ts` bővítés.
- `src/lib/store.tsx`: `handovers` állapot + akciók (`markPlanItemDelivered`, `updateHandover`, `handOverToUser`, `confirmHandoverReceipt`), az utóbbi hozza létre a leltártételt a meglévő `specForModel` felismeréssel; audit + értesítés minden lépésnél.
- `src/routes/eszkozatadas.tsx`: új referens munkatér, `PageHeading` mintával.
- `src/routes/beszerzesek.tsx`: „Beérkezett” jelölés a beszerzőnek a végrehajtás alatt lévő tételeknél.
- `src/routes/leltar.tsx` és `src/routes/igeny.$id.tsx`: átvétel-visszaigazoló blokk és beszerzési idővonal.
- `src/components/app-shell.tsx`, `src/routes/jogosultsagok.tsx`: navigáció és jogosultságkezelés az új szerephez.
- Az adatok továbbra is a demó store-ban / localStorage-ban élnek, backend nem szükséges.
