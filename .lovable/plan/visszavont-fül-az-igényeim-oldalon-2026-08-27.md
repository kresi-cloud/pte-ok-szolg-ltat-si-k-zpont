# Visszavont fül az Igényeim oldalon

## Cél
Az `/igenyeim` oldal szűrősávjában a "Piszkozatok" és a "Lezárt" gombok közé új "Visszavont" fül kerül, amely a visszavont igényeket listázza.

## Módosítás: `src/routes/igenyeim.tsx`

1. **Új fül a TABS listában** — a sorrend: Folyamatban · Piszkozatok · Visszavont · Lezárt · Mind:
   ```ts
   { key: "visszavont", label: "Visszavont" }
   ```

2. **Szűrési logika frissítése:**
   - `visszavont` fül: csak a `visszavonva` állapotú igények jelennek meg.
   - `lezart` fül: a `visszavonva` állapot kikerül a listából (így csak `lezarva` és `elutasitva` marad), hogy a visszavont igények egyértelműen a saját fülükön szerepeljenek.
   - Az `aktiv` és `mind` fülek logikája változatlan (aktiv továbbra is kizárja a visszavontakat, Mind mutat mindent).

A meglévő sorok (státuszjelvény, Visszavonás gomb, keresőmező) tovább módosítás nélkül működnek, mivel a `StatusBadge` és a `WithdrawRequestButton` már kezeli a `visszavonva` állapotot.

## Technikai részletek
- Egyetlen fájl érintett: `src/routes/igenyeim.tsx` (TABS tömb + a `filtered` szűrő feltételrendszere).
- A fül a meglévő tablist UI-ban jelenik meg, stílusa azonos a többi gombbal.
- Az oldal jelenleg beégetett magyar feliratokat használ, így az új fül címkéje is magyarul ("Visszavont") kerül be, konzisztensen.
