# Miért nem érvényesült teljesen a korábbi módosítás – és mi javítja

## Amit ellenőriztem

A kód szintjén a kért változások nagy része megvalósult: a „Milyen eszközről van szó és hol lesz használva?” kérdés sehol nincs már az űrlapon, a határidő „Tervezett határidő”-re változott, az igénylőnél nincs költségkeret mező, a jóváhagyó adatlapján viszont van.

Két konkrét hiba maradt.

## 1. A személyi használat jelölés nem érvényesül a régi termékköröknél (fő ok)

A böngészőben mentett demó adatállapot ellenőrzése szerint a termékkörök közül **csak a Notebook** hordozza a „személyi használat” jelölést; az Okostelefon, Mobiltelefon és Tablet **nem**. Ezek a termékkörök még a jelölés bevezetése előtt kerültek a helyi mentésbe, és a betöltéskor a mentett lista teljes egészében felülírja az új alapértékeket. Ezért okostelefon igénylésekor a „3. Részletek” lapon továbbra is megjelenik a „Mire használná az eszközt?” és a „Kik fogják használni?” kérdés.

Javítás: a mentett állapot betöltésekor a hiányzó `personalUse` érték pótlása az alapkatalógusból (csak ott, ahol egyáltalán nincs beállítva, hogy a beszerző saját döntéseit ne írjuk felül).

## 2. A jóváhagyó által rögzített költségkeret nem ott jelenik meg, ahol keresi

- Az Áttekintés fülön a „Költségkeret” sor egy régi, sosem kitöltött mezőt olvas, ezért mindig „Nincs megadva”.
- A jóváhagyó által mentett összeg a fejlécben „Becsült költség” néven jelenik meg, ráadásul az igény beküldésekor a rendszer automatikusan feltölti a katalógusár alapján – így már a jóváhagyó döntése előtt is látszik egy összeg.

Javítás: az Áttekintés „Költségkeret” sora a jóváhagyó által rögzített értéket mutassa, a fejléc sora pedig „Katalógus szerinti referenciaérték” néven szerepeljen, hogy a kettő elkülönüljön.

## Technikai részletek

- `src/lib/store.tsx`: a hidratálásnál a `productCategories` összefésülése az `INITIAL_PRODUCT_CATEGORIES` listával – a hiányzó `personalUse` mező pótlása azonosító alapján.
- `src/routes/igeny.$id.tsx`: az Áttekintés „Költségkeret” sora `request.budget` helyett a jóváhagyói értékből (`estimatedCost`, ha rögzítették) képződjön; a fejléc mezőjének átnevezése; a mentés maradjon auditált.
- `src/lib/i18n/dictionary.ts` / `overrides.ts`: az érintett új feliratok angol fordítása.
