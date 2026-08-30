# Beszerzői kapcsoló: termék igényelhető / nem igényelhető

## Cél

A beszerző a termékkatalógusban egy kapcsolóval (Switch) állíthassa, hogy egy termék aktuálisan igényelhető-e. A „nem igényelhető" termék eltűnik az igénylési varázslóból és az eszközátadási modellválasztóból, de a már folyamatban lévő ügyeket nem érinti.

## Jelenlegi állapot (már megvan)

- A `Product` típusnak van `active: boolean` mezője.
- A varázsló (`visibleProducts` / `productVisibleFor`) és az eszközátadási modelllista (`src/lib/handover-products.ts`) már szűr `active === true`-ra.
- A store-ban létezik `updateProduct(id, patch)`.
- Új termék felvitelekor `active: true` az alapértelmezett.

## Megvalósítás

### 1. Kapcsoló a terméktáblázatban – `src/components/product-catalog-admin.tsx`

- Minden terméksorba egy „Igényelhető" kapcsoló (Switch) kerül, amely `store.updateProduct(p.id, { active: v })`-t hív.
- A „nem igényelhető" termékek sora halványítva (pl. `opacity-60`) és „Nem igényelhető" címkével jelenik meg a katalógusban, hogy a beszerző lássa, mi van kikapcsolva.
- Ha a termékről aktív folyamat fut (függő igény, tervsor, átadás – a meglévő `product-lock` logika alapján), a kikapcsolásnál figyelmeztető megerősítés jelenjen meg: „A termékhez aktív beszerzési folyamat tartozik; a kikapcsolás csak az új igényeket tiltja, a folyamatban lévőket nem érinti." – ezzel egységes marad a törlési szabállyal.

### 2. Fordítások – `src/lib/i18n/dictionary.ts` / `overrides.ts`

Új feliratok angolul: „Igényelhető", „Nem igényelhető", a megerősítő figyelmeztetés szövege.

## Technikai részletek

- Adatmodell- és store-változás nem kell: csak a katalógus admin komponens és a szótár módosul.
- Az `active` mező a mentett demóállapotban (localStorage) is utazik; a meglévő állapot-összefésülés már kezeli az új mezőt.
- Dékáni betekintésnél (readOnly) a kapcsoló a meglévő `fieldset disabled` miatt automatikusan tiltott marad.

## Ellenőrzés

- Beszerző kikapcsol egy terméket → az igénylő varázslóban és az eszközátadási legördülőben többé nem szerepel, a katalógusban halványan, címkével látszik.
- Visszakapcsolás után mindenhol újra elérhető.
- Folyamatban lévő ügyek (függő igény, tervsor, átadás) zavartalanul végigvihetők kikapcsolt termékkel is.
- Angol nyelvváltásnál is helyes feliratok.
