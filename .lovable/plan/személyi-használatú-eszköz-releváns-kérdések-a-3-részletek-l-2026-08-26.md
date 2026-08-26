# Személyi használatú eszköz – releváns kérdések a „3 Részletek” lapon

## Mi látszik ma
Személyi használatú termékkörnél már csak két mező marad: „Hány darabra van szükség?” és „Tervezett határidő”. Ez túl szűk, ugyanakkor a darabszám felesleges.

## Az új kérdéssor (csak személyi használatnál)

1. **Igénylés indoka** – választható lista:
   - Új belépő / új munkakör
   - Meglévő eszköz cseréje (elavult)
   - Meghibásodás
   - Kiegészítő eszköz meglévő mellé

   Csere és meghibásodás esetén megjelenik egy legördülő az igénylő leltárából, ahol kiválasztja az érintett eszközt (leltárkód + szériaszám). A meglévő „hasonló eszköz” figyelmeztetés ehhez igazodik: ha indoklásként cserét jelöl, a banner tájékoztató, nem figyelmeztető hangnemű.
   - Rövid szabadszöveges kiegészítés (opcionális) az indok pontosításához.

2. **Munkavégzés helye** – épület + helyiség kiválasztása a meglévő telephely/helyiség listából (a leltárba kerüléshez és a telepítéshez).

3. **Kért átvételi hely** – az igénylő megadhatja, hol venné át az eszközt: alapértelmezés a munkavégzés helye, vagy eltérő épület/helyiség, illetve „IT ügyfélszolgálaton veszem át”.

4. **Tervezett határidő** – marad, változatlanul.

## Ami eltűnik személyi használatnál
- „Hány darabra van szükség?” – a rendszer fixen 1 db-ot rögzít.
- Már korábban törölt kérdések (mire használná, kik használják, egyszeri/tartós) továbbra sem jelennek meg.

## Megjelenítés az igény adatlapján
Az összegzésen és az igény részletei oldalon (jóváhagyó, IT referens, beszerző nézet) új sorok: Igénylés indoka (+ érintett meglévő eszköz), Munkavégzés helye, Kért átvételi hely. Az IT referens telepítési/átadási checklistje a kért átvételi helyet mutatja.

## Technikai részletek
- `src/lib/types.ts`: `Request` bővítése `requestReason`, `replacedAssetId`, `workLocation` (épület+helyiség), `handoverLocation` mezőkkel (mind opcionális, a régi adatok érintetlenek).
- `src/routes/uj-igeny.tsx`: `isPersonalUse` ágon a darabszám mező elrejtése (quantity=1), az új mezők renderelése és validálása (indok és munkavégzés helye kötelező a továbblépéshez).
- Leltár-legördülő a `src/lib/similar-assets.ts` meglévő logikájából, termékkörre szűrve.
- Épület/helyiség adatforrás a meglévő helyiség-nyilvántartásból.
- `src/routes/igeny.$id.tsx` és az összegző blokk kiegészítése az új sorokkal, `src/lib/i18n/dictionary.ts` HU/EN kulcsokkal.
