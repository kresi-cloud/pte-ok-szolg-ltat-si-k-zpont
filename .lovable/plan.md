# "Az igény útja" – az ügy aktuális gazdájának megjelenítése (korlátozott láthatósággal)

## Cél

Az igényrészletes oldal (`/igeny/$id`) Folyamat fülén, az "Az igény útja" felületen látszódjon, hogy **konkrétan kinél tart az ügy** – névvel és szerepkörrel, a folyamat aktuális szakaszától függően.

**Láthatóság:** az aktuális felelőst (és a szakaszonkénti felelősneveket) csak az ügyért felelős szerepkörök és a vezetők látják; az átlagos igénylő számára ez az információ rejtve marad.

## Jelenlegi állapot

- A Folyamat fülön van egy állapot-idővonal ("Az igény útja") és egy "Beszerzési szakasz" lista.
- A függő jóváhagyók neve már megjelenik a beszerzési szakasz első sorának apró betűs részletében (`pendingApprovers`), de a beszerzési/átadási szakaszoknál nincs felelős megjelenítve, és nincs egységes, jól látható "kinél az ügy" jelzés.

## Megvalósítás

### 1. "Az ügy jelenleg nála van" kiemelt panel – `src/routes/igeny.$id.tsx`

Az "Az igény útja" cím alá egy kiemelt sáv (kártya a szakasz tetején), amely az aktuális szakaszhoz tartozó személy(ek)et mutatja:

```text
┌──────────────────────────────────────────────────┐
│ Az ügy jelenleg nála van:                        │
│ 👤 Dr. Kovács Anna – Szervezeti jóváhagyó        │
│    (Neuróbiológiai Intézet · döntésre vár)       │
└──────────────────────────────────────────────────┘
```

A szakaszonkénti feloldási sorrend (az első teljesülő szabály nyer):

1. **Függő jóváhagyás** (`request.approvals` közül `decision === "fuggoben"`): a függő jóváhagyó(k) neve + `a.role` megjelölés, szervezeti egységgel.
2. **Beszerzési tervsor hiányzik** (jóváhagyott igény, nincs `planItem`): "Szolgáltatási ügyintéző / beszerző – tervsor létrehozására vár".
3. **Tervjóváhagyási lánc** (`planApproval.status` alapján): az adott ciklusállapothoz tartozó szerepkör felhasználója a seed adatokból (IT eszközmenedzser → Gazdasági vezető → Dékán), a dékáni határidővel (`planApproval.dueAt`, "még N nap").
4. **Beszerzés alatt** (`planItem.status === "beszerzes_alatt"`): a beszerző felhasználó neve.
5. **Átadás folyamatban** (`handover` létezik, de nem `atvetel_igazolva`): státusz szerint az IT referens (`handover.referentId`, telepítés/átadás) vagy az igénylő (`handover.recipientId`, átvételi visszaigazolásra vár).
6. **Lezárva / elutasítva / visszavonva**: nincs aktív gazda – "Az ügy lezárult" jelzés.

### 2. Beszerzési szakasz sorainak kiegészítése

A meglévő `procurementTrack` sorok `detail` mezője minden szakasznál tartalmazza a felelős nevét (nem csak az első sornál), pl. "Beszerzés folyamatban – Beszerző neve", "Telepítés – IT referens neve".

### 3. Fordítások – `src/lib/i18n/dictionary.ts`

Az összes új felirat ("Az ügy jelenleg nála van", "döntésre vár", "átvételi visszaigazolásra vár" stb.) angol megfelelője.

## Technikai részletek

- Csak `src/routes/igeny.$id.tsx` és `src/lib/i18n/dictionary.ts` módosul; segédfüggvény (pl. `currentOwnerOf(request, store)`) a komponensen belül vagy `src/lib/` segédmodulban.
- Névfeloldás a meglévő `lookup.userName()` / `lookup.unit()` segédekkel; a szerepkör-felhasználókat a `store.users` szerepkörlista alapján keressük (első találat elegendő a demóhoz).
- Nincs adatmodell- vagy store-változás; a meglévő `approvals`, `planItems`, `planApprovals`, `handovers` adatok elegendők.

## Ellenőrzés

- Beküldött, jóváhagyásra váró igénynél a jóváhagyó neve látszik.
- Dékáni tervjóváhagyásra váró tételnél a dékán neve és a határidő látszik.
- Átadás alatt álló eszköznél az IT referens, átvételre várva az igénylő neve látszik.
- Angol nyelvváltás után is helyes feliratok.
