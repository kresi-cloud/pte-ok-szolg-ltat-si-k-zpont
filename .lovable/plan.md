# Kezdőlap: banner helyett hírek blokk

## Mit változik

1. **A „Jó napot, …” banner eltűnik** a kezdőlapról. Ott van benne az intézménynév (már a fejlécben is) és az „Új igény indítása” gomb (már a fejlécben is), tehát duplikátum.
2. **Helyette egy „Hírek / Közlemények” blokk** kerül a kezdőlap tetejére – de **csak akkor jelenik meg, ha van érvényes, minden felhasználónak szóló közlemény**. Ha nincs, a kezdőlap egyből a „Teendőim” / „Mit szeretne elérni?” résszel indul.
3. **A rendszeradminisztrátor** az Adminisztráció oldalon új „Közlemények” fülön tud hírt létrehozni:
   - cím és szöveg
   - fontosság (információ / figyelmeztetés / fontos) – ez adja a blokk színét
   - **lejárati dátum** – a lejárt hír automatikusan eltűnik a kezdőlapról
   - közzététel / visszavonás és törlés
   - lista az aktív és lejárt közleményekről
4. A hír a portál minden bejelentkezett felhasználójának megjelenik, szerepkörtől függetlenül. A felhasználó egy hírt „elrejthet” magának (bezárás X-szel), a fontos szintű hír nem rejthető el.

## Technikai részletek

- Új típus `Announcement` a `src/lib/types.ts`-ben: `id, title, body, level, publishedAt, expiresAt, active, createdBy`.
- `src/lib/seed.ts`: 1 demó közlemény (jövőbeli lejárattal), hogy a blokk látszódjon a prototípusban.
- `src/lib/store.tsx`: `announcements` state + `addAnnouncement`, `updateAnnouncement`, `removeAnnouncement`, `dismissAnnouncement`, valamint `activeAnnouncements` szűrő (aktív ÉS nem lejárt ÉS nem elrejtett). Az admin műveletek auditálva lesznek, a meglévő minta szerint. A tárolás továbbra is localStorage.
- Új komponens `src/components/announcements-banner.tsx` – nem renderel semmit, ha nincs aktív hír.
- `src/routes/index.tsx`: a `pte-band` hero szekció törlése, helyette a hírek blokk; a lap címsora egy tömör `h1` marad (SEO/akadálymentesség miatt kell egy H1).
- `src/routes/adminisztracio.tsx`: új „Közlemények” `TabsTrigger`/`TabsContent` űrlappal (cím, szöveg, szint, lejárat dátumválasztó) és listával.
