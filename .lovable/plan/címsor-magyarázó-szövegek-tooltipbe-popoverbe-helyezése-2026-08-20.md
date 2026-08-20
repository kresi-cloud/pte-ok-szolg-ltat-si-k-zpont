# Címsor-magyarázó szövegek tooltipbe/popoverbe helyezése

## Cél
A menüből nyíló oldalakon (pl. Személyi leltár) a címsor alatt állandóan megjelenő magyarázó bekezdések ne foglaljanak helyet a felületből. Helyette a címsor legyen interaktív: desktopon a kurzor ráhúzására tooltipben, mobilon egy információs ikonra koppintva popoverben jelenjen meg a leírás.

## Érintett oldalak
A portál fő navigációjából (AppShell NAV) nyíló route-ok, ahol címsor után közvetlenül magyarázó bekezdés szerepel:
- `src/routes/leltar.tsx` – Személyi leltár
- `src/routes/igenyeim.tsx` – Igényeim (meta-szerű alapszöveg)
- `src/routes/uj-igeny.tsx` – Új igény (ha van bevezető szöveg)
- `src/routes/beszerzesi-terv.tsx` – Beszerzési terv
- `src/routes/eletciklus-elorejelzes.tsx` – Életciklus-előrejelzés
- `src/routes/eszkozkataszter.tsx` – Eszközkataszter
- `src/routes/fejlesztesek.tsx` – Fejlesztések
- `src/routes/felelossegek.tsx` – Szolgáltatások és felelősségek
- `src/routes/jovahagyasok.tsx` – Jóváhagyási sor (mindkét nézetben)
- `src/routes/szolgaltatasok.tsx` – Szolgáltatáskatalógus
- `src/routes/portfolio.tsx` – Fejlesztési portfólió
- `src/routes/munkater.tsx` – Szolgáltatási munkatér
- `src/routes/vezetoi-attekintes.tsx` – Vezetői áttekintés
- `src/routes/adminisztracio.tsx` – Adminisztráció
- `src/routes/jogosultsagok.tsx` – Jogosultságkezelés
- `src/routes/beszerzesek.tsx` – Beszerzői munkatér
- `src/routes/segitseg.tsx` – Segítség

A nem oldalbevezető bekezdések (kártya-leírások, tab-utasítások, űrlap-magyarázatok) nem érintettek.

## Megvalósítás
1. **Új újrafelhasználható komponens**
   - Fájl: `src/components/page-heading.tsx` (vagy `src/components/page-heading-tooltip.tsx`)
   - Feladata: fogadja a címsor szövegét (`title`) és a magyarázó szöveget (`description`), valamint opcionálisan gyermek-címsort (h1).
   - Desktop: a címsor `<h1>` legyen `TooltipTrigger`, a szöveg `TooltipContent`-ben jelenjen meg.
   - Mobil: az `<h1>` mellé egy kis `Info` / `CircleHelp` ikon legyen `PopoverTrigger`, a szöveg `PopoverContent`-ben jelenjen meg.
   - A komponens importálja a meglévő `src/components/ui/tooltip.tsx` és `src/components/ui/popover.tsx` primitíveket.
   - A megjelenítés ne változtassa meg a címsor aktuális tipográfiai stílusát (`font-display text-2xl font-semibold` stb.).

2. **Route-ok átalakítása**
   - Minden érintett oldalon a `h1` + alatta lévő `p` helyettesítése az új komponenssel.
   - A magyarázó szövegek szó szerint megtartása, csak a megjelenítés módja változik.
   - Különleges szerkezetű fejléceknél (pl. Vezetői áttekintés színes banner) a komponens használata a banneren belül, hogy ott is eltűnjön az állandó alapszöveg.
   - Jogosultsági visszautasító nézeteknél (Jogosultságkezelés, Beszerzői munkatér, Jóváhagyási sor) a leírás ott is tooltipbe kerül, ahol a címsor mellett nincs más tartalom.

3. **Reszponzív viselkedés**
   - `md:` breakpointtól felfelé (desktop) a tooltip aktív; az információs ikon rejtett.
   - Mobilon (`max-md:`) a tooltip nem működik, helyette a címsor melletti ikonra koppintva popover nyílik.
   - A `TooltipProvider` már a `__root.tsx`-ben vagy a komponensen belül elhelyezhető.

4. **i18n kompatibilitás**
   - A DOM-translator továbbra is lefordítja a tooltip/popover szövegét, mert az továbbra is a DOM-ban jelenik meg.
   - A címsorokat és leírásokat nem kell külön dictionary-be tenni, a meglévő magyar szövegek maradnak alapértelmezetten.

## Ellenőrzés
- Build/typecheck futtatása a változtatások után.
- Preview-ben desktopon ellenőrizni, hogy a címsorokra húzva az egeret megjelenik a tooltip, és az alatta lévő állandó szöveg eltűnt.
- Mobilnézetben (preview device toggle) ellenőrizni, hogy az info ikon látható, és koppintásra popover jelenik meg a leírással.
- Győződni meg róla, hogy a nem bevezető szövegek (kártyák, tabok, űrlapok) továbbra is láthatók maradnak.
