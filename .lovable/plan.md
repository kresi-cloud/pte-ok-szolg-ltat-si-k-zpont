# Folyamat-finomítások – konkrét megoldási terv

A korábbi átnézés 8 pontjára konkrét megvalósítás, prioritási sorrendben.

## 1. Zsákutca-ágak kezelése (elutasított / visszavont igények)

**Probléma:** `requestSituation()` nem kezeli az `elutasitva` és `visszavont` állapotokat – tévesen „IT besorolás alatt" állapotot mutat, és a demóvezérlő megrekedhet.

**Megoldás:**
- `src/lib/request-situation.ts`: az `igeny.status` ellenőrzése legyen a levezetés **első** ága, a jóváhagyás-lánc vizsgálata előtt:
  - `elutasitva` → „Elutasítva – [elutasító neve, indok]" helyzet, nincs következő teendő, felelős: n/a.
  - `visszavont` → „Visszavonva az igénylő által" helyzet, nincs következő teendő.
- `process-steps.ts`: a folyamatjelző lépésindexe ezeknél maradjon a beküldésig elért utolsó lépésen, jelöléssel, hogy a folyamat megszakadt.
- A demóvezérlő (`demo-flow.ts`) ezeket a státuszokat ismert záróállapotként kezelje (ne várjon további lépést).

## 2. Beérkezés → konfigurálás átmenet egyértelműsítése

**Probléma:** a beérkezés rögzítése után a tétel vizuálisan „késznek" tűnik, miközben még a konfigurálás hátravan.

**Megoldás:**
- `plan-stage.ts`: a beérkezett, de még nem konfigurált tétel származtatott állapota legyen explicit: „**Beérkezett – konfigurálásra vár**", felelős: a kari IT referens (Bercsényi L.).
- `beszerzesek.tsx`: ilyen tételnél a „Kire vár" oszlopban a referens neve, és az elsődleges művelet a referens munkaterére mutató link legyen („Konfigurálás megkezdése" → `/eszkozatadas`).
- Elavult szöveg javítása: „a dékán hagyja jóvá" → „a gazdasági vezető zárja a tervezést" (beszerzői munkatér leírása).

## 3. Határidő-figyelmeztetés a „kire vár" oszlopban

**Megoldás:**
- `plan-stage.ts` / „kire vár" cella: ha a tétel `plannedDeadline`-ja múltbeli ÉS a tétel nincs lezárva → a határidő piros jelöléssel + „Késedelmes" chip jelenjen meg.
- Kis segédfüggvény (`isOverdue(item, today)`), a demó rögzített dátumát is figyelembe véve.
- A `RequestSituationCard`-on is jelenjen meg, ha az igény tervezett határideje lejárt.

## 4. Vezetői összefoglaló kiegészítése

**Megoldás** – a vezetői nézetben származtatott aggregátumok (nincs adatduplikáció):
- Lépésenkénti megoszlás: hány tétel áll az egyes 8 lépésben.
- Átlagos várakozási idő lépésenként (a tétel `updatedAt`/audit időbélyegei alapján).
- Késedelmes tételek listája felelőssel együtt.

## 5. Szerepkör-hozzárendelések központosítása

**Megoldás:**
- Új `src/lib/process-roles.ts`: egyetlen `STEP_RESPONSIBLE: Record<StepIndex, RoleKey>` tábla + név-feloldó függvény.
- `process-steps.ts`, `request-situation.ts`, `demo-flow.ts`, `plan-stage.ts` mind ebből vegye a felelőst – a jelenlegi szétszórt név-/szerepkör-literalok megszűnnek.
- Teszt: minden lépés felelőse létező, aktív felhasználóra oldódik.

## 6. Örökölt státusz-normalizálás egy helyre

**Megoldás:**
- Egyetlen `normalizeLegacyStatus()` függvény (`plan-stage.ts`-ben), amely a `dekani_jovahagyas` / `jovahagyasra_var` → `gazdasagi_felulvizsgalat` leképezést végzi.
- `demo-flow.ts` és a store migrációja ezt hívja; a tripla implementáció törlése.

## 7. Admin visszaállítás rejtése

**Megoldás:**
- `eszkozatadas.tsx`: a már átadott tételnél a „visszaállítás" gomb csak `admin` szerepkörrel látszik, felirata „Átadás visszavonása (admin helyreállítás)", megerősítő dialógussal, audit-bejegyzéssel.

## 8. Tesztek bővítése

- Elutasított / visszavont igény helyzete helyes (1. pont).
- Beérkezett-nem-konfigurált tétel „konfigurálásra vár" + referens a felelős (2. pont).
- Késedelmes tétel felismerése (3. pont).
- Lépés-felelős feloldás minden lépésre (5. pont).
- Legacy státusz normalizálás (6. pont).

## Nem változik

Architektúra, route-ok, `routeTree.gen.ts`, a 8 lépés sorrendje és neve, a tervciklus-szintű műveletek és a dékáni betekintés.

## Ellenőrzés

`bunx tsgo --noEmit`, `bun test`, `bun run build` – mind zöld legyen. Böngészős végigkattintás csak külön kérésre.

## Technikai megjegyzés

A módosítások tiszta levezetések és UI-finomítások; az adatmodellhez (mezők, státuszértékek) nem nyúlunk, a localStorage-os seed kompatibilis marad.
