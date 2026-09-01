# Döntési sor + beszerző átnevezése Dr. Hollósyra

## Cél
1. A beszerző felhasználó Csanaki G. helyett **Dr. Hollósy** legyen (meglévő `u-beszerzo` azonosító megtartásával, hogy minden folyamat és demó tovább működjön).
2. Az igény részletei oldalon új **„Döntési sor"** blokk: kronologikus, olvasható döntési idővonal (ki, mikor, mit döntött, indoklással), a beszerzési lánc döntéseivel.

## Módosítások

### 1. Beszerző átnevezése (`src/lib/seed.ts`)
- `u-beszerzo`: név → „Dr. Hollósy …", titulus „beszerzési referens", e-mail `hollosy…@aok.pte.hu`, monogram `DH` frissítése. Fiktív adat marad.
- Minden hivatkozás (`demo-users.ts`, `demo-flow.ts`, `asset-data.ts`, tesztek) az `u-beszerzo` ID-t használja, így nem igényelnek módosítást; szöveges „Csanaki" előfordulások ellenőrzése `rg`-vel, javítása, ha van.

### 2. Döntési sor a request detail oldalon (`src/routes/igeny.$id.tsx`)
- Új **„Döntési sor"** szakasz az „Előzmények (audit napló)" fülön belül (vagy saját fülön, ha áttekinthetőbb) — a meglévő adatmodellből származtatva, adatduplikáció nélkül:
  - `request.approvals` tételei: lépés, szerepkör, jóváhagyó neve, döntés (jóváhagyva/elutasítva/pontosítás), dátum, megjegyzés.
  - Beszerzési lánc döntései az `audit` eseményekből szűrve (tervsor létrehozás, átadás eszközmenedzsernek, csomagba sorolás, gazdasági jóváhagyás/visszaküldés, beszerzés indítása, beérkezés, átadás, átvétel-igazolás, visszavonás).
- Megjelenés: vertikális idővonal (intézményi stílus), sorrendben dátum + szereplő + szerepkör + döntés + indoklás; státusz nem csak színnel jelölve (ikon + szöveges címke).
- Üres állapot: „Még nem született döntés ebben az ügyben." — a beküldés eseménye mindig látszik első tételként.

### 3. Segédfüggvény (`src/lib/decision-trail.ts`)
- `buildDecisionTrail(request, procurementState)`: egységes, tesztelhető függvény, amely a jóváhagyásokat és a döntés-jellegű audit eseményeket egyetlen kronologikus tömbbe fűzi (`{ at, actorId, role, decision, detail }`).

### 4. Ellenőrzések
- Egységteszt `buildDecisionTrail`-re: sorrend, demófolyamat végén a teljes lánc megjelenik, visszavont ügynél a visszavonás utolsó tétel.
- `bunx tsgo --noEmit`, `bun test` (meglévő 22 teszt zöld marad), build ellenőrzés.
- Böngészős rövid ellenőrzés: demófolyamat végén az igény oldalon a döntési sor tartalmazza Dr. Hollósy beszerzői lépéseit.

## Technikai megjegyzések
- Backend és új adatmodell nem kell: a döntési sor a meglévő `approvals` + `audit` mezőkből derivált.
- A `u-beszerzo` ID változatlan → leltárhelyiség-hozzárendelés (`loc-dekani-6`), demólépések és routing érintetlen.
- Minden új szöveg magyar.
