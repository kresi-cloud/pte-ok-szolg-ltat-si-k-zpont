# Dékáni jóváhagyás kivezetése – a tervet a gazdasági vezető zárja le

## Cél

A beszerzési tervciklus jóváhagyási láncából kikerül a dékáni lépés. A tervezési folyamatot a gazdasági vezető zárja le jóváhagyással, ezután indulhat a beszerzés. A dékán továbbra is minden felületet és minden adatot lát, de csak betekintőként (ez a jelenlegi read-only szabály, változatlanul).

## Az új lánc

```text
IT eszközmenedzser (tervezés)
   → beküldés gazdasági ellenőrzésre
Gazdasági vezető (ellenőrzés)
   → Jóváhagyom  → Beszerző: beszerzés indítása
   → Átdolgozásra visszaküldöm → IT eszközmenedzser
```

A korábbi „Dékáni jóváhagyás" lépcső eltűnik a folyamatábrából, a státuszcímkékből, a „Kire vár" sorokból és a munkatér mutatóiból.

## Mi változik a felületeken

- **Beszerzői munkatér (/beszerzesek):** a folyamat 4 lépés helyett 3 (Eszközmenedzseri tervezés → Gazdasági ellenőrzés → Beszerzés indítása). A gazdasági vezetőnél a „Továbbítás dékáni jóváhagyásra" gomb helyére a „Jóváhagyom" és „Átdolgozásra visszaküldöm" gombok kerülnek. A dékán a kártyát látja, gomb nélkül. A jobb felső mutató „Dékáni jóváhagyásra vár" helyett „Gazdasági jóváhagyásra vár".
- **Igény részletei (/igeny/$id) és a helyzetkártya:** ahol eddig a dékán szerepelt következő döntéshozóként a tervciklusnál, ott a gazdasági vezető jelenik meg.
- **Határidő-szövegek:** „dékáni jóváhagyási határidő" helyett „jóváhagyási határidő".
- **Vezetőségi demó:** a 13 lépésből a 7. (gazdasági ellenőrzés) és 8. (dékáni jóváhagyás) egyetlen lépéssé olvad, a demó 12 lépéses lesz; a demóvezérlő a gazdasági vezetőre irányít.
- Az igényszintű (nem tervciklus) jóváhagyásoknál semmi nem változik.

## Technikai részletek

- `src/lib/asset-types.ts`: a `dekani_jovahagyas` és `jovahagyasra_var` státusz megmarad örökölt értékként (mentett állapotok miatt), de a címkéjük és kezelésük a gazdasági ellenőrzésre mutat.
- `src/lib/store.tsx`: a betöltési migráció a `dekani_jovahagyas` / `jovahagyasra_var` állapotot `gazdasagi_ellenorzes`-re írja át. A `financeReviewPlan` „tovabb" ága `jovahagyva` státuszt állít (nem `dekani_jovahagyas`), a napló- és értesítésszövegek ehhez igazodnak. A `decidePlanApproval` a gazdasági vezető jogköre lesz, a dékáné megszűnik.
- `src/routes/beszerzesek.tsx`: `STEPS`, `WAITING_ON`, az `isDean` ágak, a mutatók és a hozzáférési szöveg frissítése.
- `src/lib/request-situation.ts`, `src/routes/igeny.$id.tsx`: a tervciklus felelőse a gazdasági vezető.
- `src/lib/demo-flow.ts` + `src/lib/__tests__/demo-flow.test.ts`: `DEMO_TOTAL_STEPS` 12, a lépések újraszámozása.
- `src/lib/access.ts`: változatlan – a dékán minden területen betekintő marad.
- Lefuttatjuk a típusellenőrzést, a teszteket és a buildet.
