# Új felhasználó létrehozása admin által

## Jelenlegi állapot

A felhasználók kizárólag a `src/lib/seed.ts`-ben rögzített demó adatokból jönnek. A Jogosultságkezelés oldalon (`/jogosultsagok`) az admin csak meglévő felhasználók szerepköreit és besorolását tudja módosítani — új felhasználó felvételére nincs lehetőség.

## Megoldás

A Jogosultságkezelés oldalon admin jogkörrel egy „Új felhasználó" gomb nyit egy űrlapot (párbeszédablak), ahol az admin megadja:

- Név, beosztás, e-mail cím, dolgozói azonosító
- Szervezeti egység (legördülő a meglévő egységekből)
- Szerepkörök (jelölőnégyzetek, mint a meglévő szerkesztőben)
- Munkavállalói besorolás (alkalmazotti / vezetői / felsővezetői)
- Közvetlen felettes (opcionális, a meglévő felhasználók közül)
- Rövid indoklás (kötelező, mint a szerepkör-módosításnál)

Mentéskor az új felhasználó bekerül a felhasználók listájába (alapértelmezetten `igenylo` szerepkörrel, ha mást nem jelöltek ki), a művelet bekerül a jogosultsági naplóba, és a felhasználó azonnal kezelhető a meglévő felületen. A dékán továbbra is csak olvashatóan látja az oldalt, az új gomb nála nem jelenik meg.

## Technikai részletek

- `src/lib/store.tsx`: új `addUser(user, reason)` művelet — a felhasználót hozzáadja a `users` listához, naplóbejegyzést ír a `roleAudit`-ba. Az új felhasználók a meglévő hidratációs mechanizmusba illeszkednek (a mentett állapotban utaznak, a seedhez hasonlóan).
- `src/lib/types.ts`: nincs modellváltozás; az egyedi azonosítót a store generálja (`u-` előtag + véletlen/egyedi utótag), a monogramot a névből származtatjuk.
- `src/routes/jogosultsagok.tsx`: „Új felhasználó" gomb + létrehozó űrlap (Dialog), validációval (kötelező mezők, egyedi e-mail).
- `src/lib/i18n/overrides.ts`: angol fordítások az új feliratokhoz.
- Ellenőrzés: build + manuális teszt — új felhasználó létrehozása, megjelenés a listában, szerepkör-módosítás rajta.
