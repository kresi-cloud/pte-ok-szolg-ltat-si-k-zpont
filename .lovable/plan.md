# Fókusz az informatikai eszközigénylésre

A kezdőlap és a felső menüsáv az eszközbeszerzésre szűkül, a "Hardver" elnevezés pedig mindenütt "Informatikai eszköz" lesz.

## Kezdőlap csempék
- Az "Informatikai eszköz" csempe kerül az első helyre.
- A többi csempe (Szoftver, Honlap és webes megjelenés, Digitalizáció) halványítva, nem kattinthatóan jelenik meg, "Hamarosan elérhető" jelzéssel; billentyűzettel sem fókuszálhatók.
- A "Mit szeretne elérni?" blokk bevezető szövege az eszközigénylésre utal.

## Elnevezés
- A hardver domén megjelenített neve "Hardver" helyett "Informatikai eszköz" (rövid név: "Informatikai eszközök és perifériák"). A belső kulcs (`hardver`) és az igényazonosító előtag (HW) változatlan marad, hogy a meglévő adatok és folyamatok ne sérüljenek.
- Az angol felület szótárában a megfelelő fordítás: "IT equipment".

## Felső menüsáv (banner)
Az eszközbeszerzéshez nem kapcsolódó menüpontok elrejtése minden szerepkörnél:
- Szolgáltatások, Fejlesztések, Szolgáltatási munkatér, Fejlesztési portfólió, Szolgáltatások és felelősségek.
- Megmaradnak: Kezdőlap, Új igény, Igényeim, Személyi leltár, Eszközkataszter, Beszerzői munkatér, Beszerzési terv, Eszközátadás, Selejtezési javaslat, Életciklus-előrejelzés, Jóváhagyási sor, Vezetői áttekintés, Adminisztráció, Jogosultságkezelés, Segítség.
- A globális keresőből is kikerülnek a fejlesztési kezdeményezés / szolgáltatás / szervezeti felelősség találatok.

## Technikai megjegyzések
- `src/lib/seed.ts`: hardver domén `name`/`short`/`description` szövegek frissítése.
- `src/routes/index.tsx`: domének sorrendje, letiltott csempék (nem `Link`, hanem `div` `aria-disabled`-del, `opacity-60`).
- `src/components/app-shell.tsx`: érintett `NAV` bejegyzések eltávolítása (a route-ok megmaradnak, csak nem jelennek meg a menüben).
- `src/components/global-search.tsx`: a nem eszközös csoportok kivétele.
- `src/lib/i18n/dictionary.ts`: érintett magyar szövegek angol párjainak frissítése.
