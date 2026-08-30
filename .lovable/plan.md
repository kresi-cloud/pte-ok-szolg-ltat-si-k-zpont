# Minden igény létező, elérhető döntéshozóhoz kerüljön

## Mit találtam a jelenlegi állapotban

- Igen, jól látja – de a pontos ok más: **Dr. Perneczky Zs. (`u-fekete`) létezik** a törzsadatban (Anatómiai Intézet, `jovahagyo` szerepkör), viszont **nem szerepel a demó bejelentkezési / felhasználóváltó listában** (`src/lib/demo-users.ts`). Így az ASUS notebook igény első jóváhagyása hozzá kerül, de senki nem tud a nevében belépni → az ügy megáll.
- Ugyanez érint minden jóváhagyót és ügyintézőt, aki nincs a listában: Dr. Hollósy I., Dr. Kaposvári M., Dr. Ecsedi K., Bihari E., Görömbei D., Vasadi Á., Szemerey N., Bethlendi B., Prof. Dr. Rónaszéki L.
- Két további, tartalmi elakadási kockázat:
  1. **Önjóváhagyás:** az intézetigazgatók (Élettani, Anatómiai, Biokémiai, Farmakológiai) egyben a saját egységük jóváhagyói. Ha ők adnak be igényt, saját magukat kapják meg 1. jóváhagyónak.
  2. **Helyi IT referens:** egyetlen ilyen felhasználó van (Bercsényi L., Élettani Intézet), minden más egység átadása is hozzá esik vissza.
- Az admin által létrehozott új felhasználók a meglévő egységekbe kerülnek, így öröklik ezeket a hiányokat.


## Megoldás

1. **Hiányzó szereplők pótlása** a törzsadatokban:
   - Minden szervezeti egységhez helyi IT referens (Anatómiai, Biokémiai, Farmakológiai, Oktatásszervezési, Kutatástámogatási, Klinikai, Dékáni Hivatal — az IT egységre a meglévő eszközmenedzser mellé is), PTE-stílusú névvel, e-mail-lel, azonosítóval.
   - Az intézetekhez egy-egy helyettes jóváhagyó (igazgatóhelyettes) `jovahagyo` szerepkörrel, aki az igazgató saját igényét jóváhagyja.
2. **Központi útvonal-feloldó** (`src/lib/routing.ts`): egyetlen helyen dől el, ki a következő döntéshozó/ügyintéző. Szabályai:
   - 1. jóváhagyó = az egység jóváhagyója; ha az azonos az igénylővel, akkor az egység helyettes jóváhagyója; ha az sincs, a hivatalvezető; ha az sem, a dékán.
   - 2. jóváhagyó = a csapat gazdája; ha nem létező azonosító, a szolgáltatásgazda szerepkörű felhasználó.
   - Átadási referens = az egység IT referense, egyébként bármely IT referens.
   - A feloldó mindig a futásidejű felhasználólistán dolgozik (seed + admin által létrehozott felhasználók), és garantáltan létező azonosítót ad vissza.
3. **A store beépítése:** az igénybeküldés, az átadás-létrehozás és minden olyan pont, ahol ma közvetlen `u-...` beégetés vagy `?? "u-nagy"` szerepel, ezt a feloldót hívja.
4. **Meglévő adatok kijavítása:** a betöltéskor futó hidratáció ellenőrzi a mentett igényeket és átadásokat; ha egy jóváhagyó/ügyintéző azonosító nem létező felhasználóra mutat, vagy az igénylővel azonos, átirányítja az érvényes döntéshozóra.
5. **Angol fordítások** az új felhasználók beosztásaihoz, ha szükséges.

## Tesztelés

Playwright-tal végigfuttatom a teljes láncot mind a kilenc szervezeti egységből egy-egy igénylővel: beküldés → 1. és 2. jóváhagyás → beszerzési terv → gazdasági vezetői ellenőrzés → dékáni jóváhagyás → beszerzés → helyi IT referens telepítés és átadás → átvétel visszaigazolása → leltár. Külön eset: intézetigazgató saját igénye (önjóváhagyás elkerülése) és admin által frissen létrehozott felhasználó igénye. Minden lépésnél ellenőrzöm, hogy a megjelenő döntéshozó név feloldható, és nincs üres/„ismeretlen" felelős.

## Technikai részletek

- Érintett fájlok: `src/lib/seed.ts` (új felhasználók, egységenkénti helyettes jóváhagyó mező), `src/lib/types.ts` (`OrgUnit.deputyApproverUserId`), új `src/lib/routing.ts`, `src/lib/store.tsx` (beküldés, átadás, hidratációs javítás), `src/lib/i18n/overrides.ts`.
- Nincs adatbázis, minden a meglévő böngészőben tárolt állapotban marad; a hidratációs javítás visszamenőleg is rendbe teszi a már mentett demóállapotot.
