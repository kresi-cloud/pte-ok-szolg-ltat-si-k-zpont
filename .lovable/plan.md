# „Mikorra kéri a beszerzést?" – dinamikus negyedévlista

Az `/uj-igeny` oldal „3. Részletek" lépésében az ütemezés-kérdés átneveződik, és a legördülő lista a jelenlegi dátumhoz képest a következő negyedévtől induló négy negyedévet kínálja fel évszámmal, végül az „Azonnali beszerzés (indoklás szükséges)" opcióval.

Példa (demódátum 2026-09-01): `2026. IV. negyedév`, `2027. I. negyedév`, `2027. II. negyedév`, `2027. III. negyedév`, `Azonnali beszerzés (indoklás szükséges)`.

## Amit az igénylő lát

- A kérdés felirata: „Mikorra kéri a beszerzést?"
- A lista opciói dinamikusak: mindig az aktuális (demómódban a demó-) dátumot követő negyedévvel kezdődnek, négy negyedévet ölelnek fel, évfordulónál az évszám vált.
- A kiválasztott érték az összegzésben és az igény leírásában évszámmal együtt jelenik meg (pl. „Igényelt ütemezés: 2027. I. negyedév").
- Az azonnali opció viselkedése változatlan: kötelező indoklásmező, magas prioritás.

## Technikai részletek

- `src/lib/clock.ts` (vagy új `src/lib/quarters.ts`): `upcomingQuarters(fromIso): { value: string; label: string }[]` segédfüggvény – a `todayIso()`-ból számítja a következő 4 negyedévet (`{year, quarter}` párok), a label formátuma `2027. I. negyedév`. Demómódban automatikusan a demódátum az alap.
- `src/lib/types.ts`: `RequestedTiming` bővítése – a negyedéves érték `"${year}-${Quarter}"` formátumú (pl. `"2027-Q1"`), az `"azonnali"` marad. A `REQUESTED_TIMING_LABELS` statikus térkép helyett `requestedTimingLabel(value)` függvény, amely az évszámot és a `QUARTER_LABELS`-t használja.
- `src/routes/uj-igeny.tsx`: feliratcsere; az opciólista az `upcomingQuarters(todayIso())`-ból épül + azonnali opció; az összegzés és a generált szöveg az új label-függvényt használja; a demókitöltő gomb az első (következő) negyedévet vagy az azonnalit állítja be a meglévő logika szerint.
- `src/lib/request-procurement.ts`: a `requested` érték felparsolása (`év-negyedév`); a tervsor `quarter` mezője a parsolt negyedév, a commentbe az évszámos felirat kerül; az azonnali ág változatlan.
- `src/routes/igeny.$id.tsx`: az igényelt ütemezés megjelenítése az új label-függvénnyel.
- `src/lib/i18n/dictionary.ts`: az új felirat angol fordítása.
- Tesztek: `upcomingQuarters` egységteszt (évhatár-átlépés, demódátum-determinizmus); a request-procurement parsolás tesztje; build + lint + typecheck futtatása.

## Megkötés

- A `RequestedTiming` formátumváltozás miatt a korábbi, csupasz negyedév-értékeket (`"Q1"` stb.) tartalmazó seed/memória-adatoknál visszafelé kompatibilis parsolás kell, vagy a meglévő demóadatok átírása az új formátumra.
