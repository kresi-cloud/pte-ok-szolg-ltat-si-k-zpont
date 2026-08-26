# Igénylési űrlap egyszerűsítése és költségkeret áthelyezése

## 1. Személyi használat jelölése a termékkörnél

A termékkör kap egy új, beszerző által kezelt jelölést: **személyi használatú eszközkör**. A beszerzői Termékkatalógus felületen a termékkör létrehozásakor és szerkesztésekor kapcsolóval állítható, a listában jelölés mutatja. Kezdőértékek: notebook, okostelefon, mobiltelefon, tablet → személyi; asztali gép, workstation, kijelző, projektor, perifériák, nyomtató → nem személyi.

## 2. Kérdések a „3. Részletek” lapon

- **„Milyen eszközről van szó és hol lesz használva?”** – teljesen törlődik, minden ágból.
- **„Mire használná az eszközt?”** és **„Kik fogják használni?”** – személyi használatú termékkör választása esetén nem jelenik meg. Nem személyi körnél (pl. projektor, nyomtató, közös kijelző) továbbra is megmarad.
- Az összegzésben a kihagyott mezők nem jelennek meg üresen; a leírás/cél a kiválasztott termékből generált szövegből áll össze.

## 3. Határidő átnevezése

A „Van kívánt határidő?” kérdés helyett **„Tervezett határidő”** szerepel az űrlapon; ugyanez a megnevezés jelenik meg az összegzésben és az igény adatlapján. Az angol felületen: „Planned deadline”.

## 4. Költségkeret a jóváhagyónál

- Az igénylő űrlapjáról a **költségkeret mező eltűnik**.
- Az igény adatlapján a **soron következő elsődleges (szervezeti) jóváhagyó** kap egy szerkeszthető költségkeret mezőt, amelyet a döntés előtt kitölthet és menthet.
- A rögzített keret utána mindenki számára olvasható marad az Áttekintés fülön, és bekerül az igény előzményeibe (auditnapló).
- Amíg nincs kitöltve: „Nincs megadva”.

## Technikai részletek

- `src/lib/types.ts`: `ProductCategory.personalUse?: boolean`.
- `src/lib/product-catalog.ts`: kezdeti termékkörök jelölése.
- `src/components/product-catalog-admin.tsx`: kapcsoló a termékkör űrlapon és jelölés a listában (a meglévő betekintési/fieldset logikával).
- `src/routes/uj-igeny.tsx`: `device` kérdés és mező eltávolítása; `hw-goal` és `users` blokk feltételes megjelenítése a kiválasztott termékkör `personalUse` értéke szerint; költségkeret mező törlése; határidő címke módosítása; összegzés sorainak igazítása.
- `src/routes/igeny.$id.tsx`: költségkeret megjelenítés + szerkesztő mező a függő elsődleges jóváhagyónál, mentés `store.updateRequest` hívással, auditbejegyzéssel.
- `src/lib/i18n/dictionary.ts` és `overrides.ts`: elavult kulcsok törlése, új szövegek angol fordítása.
