# Javítási javaslat: igénylői nézet és gazdasági vezetői jóváhagyási felület

Két hiba derült ki, mindkettő jogosultsági/nézet-szintű:

1. Az igénylő (Krassó) az igénye részleteinél a negyedéves beszerzési terv teljes felületét eléri: a "Beszerzési terv megnyitása" link mindenkinek megjelenik, és a `/beszerzesi-terv` oldalon nincs szerepkör-ellenőrzés (csak a dékánnál van betekintő mód). Ráadásul azonnali beszerzésre sorolt tételnél is "negyedéves terv" szöveg jelenik meg.
2. A gazdasági vezető a `/beszerzesi-terv` oldalon új tervtételt tud felvinni (ez nem az ő feladata), a beszerzői munkatérben viszont csak akkor lát műveletet, ha a ciklus már "gazdasági ellenőrzés" állapotban van. A jelenlegi ciklusok "beszerzői/eszközmenedzseri tervezés" állapotban állnak, ezért nála üres a felület – nem derül ki, mire vár és kire vár.

## Javasolt javítás

### Igénylői nézet (igény részletei)

- A tervsor-sáv csak státuszinformációt mutasson: azonnali besorolásnál "Azonnali beszerzési csomagba került", negyedévesnél "A(z) 2027. évi terv II. negyedévébe került", darabszámmal.
- A "Beszerzési terv megnyitása" link csak tervezési szerepköröknek (eszközmenedzser, beszerző, gazdasági vezető, vezető, dékán) jelenjen meg.
- Az igénylő a folyamat fülön továbbra is lássa, hogy éppen kinél van az ügy.

### Oldalvédelem

- A `/beszerzesi-terv` oldal kapjon szerepkör-kaput: szerkeszthető az eszközmenedzsernek és a beszerzőnek; a gazdasági vezető, vezető és dékán csak betekintő módban nyithatja; egyéb szerepkör (igénylő, ügyintéző) átirányító üzenetet lát, mint a beszerzői munkatéren.
- Az "Új tétel" fül csak szerkesztési joggal (eszközmenedzser, beszerző) jelenjen meg; gazdasági vezetőnél eltűnik.

### Gazdasági vezetői jóváhagyási felület

- A beszerzői munkatéren új, szerepkör-szerinti "Rám vár" blokk: a gazdasági vezető felül látja a `gazdasági ellenőrzés` állapotú ciklusokat közvetlen ellenőrző gombokkal (továbbküldés dékánhoz / visszaküldés az eszközmenedzsernek).
- Az ettől eltérő állapotú ciklusoknál a kártya írja ki egyértelműen, hogy kire vár: "Az IT eszközmenedzser beküldésére vár", "A dékán döntésére vár", "A beszerző indítására vár" – így nem tűnik üresnek a felület.
- A "tervezés" állapotú, tételeket már tartalmazó ciklusnál a gazdasági vezető kapjon "Beküldés sürgetése" gombot, amely értesítést és auditbejegyzést hoz létre az eszközmenedzsernek (a beküldés joga marad az eszközmenedzsernél).
- A felső statisztika "Dékáni jóváhagyásra vár" csempéje mellé kerüljön "Gazdasági ellenőrzésre vár" csempe; a számláló a normalizált státuszt használja (a régi `jovahagyasra_var` érték is beleszámít).

## Technikai részletek

- `src/routes/igeny.$id.tsx`: a `planItem` sáv szövege a `planItem.timing` alapján ágazzon el; a link `canSeePlan` szerepkör-feltétel mögé kerül.
- `src/lib/access.ts`: új `canPlanProcurement(role)` és `canReviewProcurement(role)` segédfüggvény, hogy a kapuzás egy helyen legyen.
- `src/routes/beszerzesi-terv.tsx`: korai visszatérés jogosulatlan szerepkörnél; az "Új tétel" `TabsTrigger`/`TabsContent` feltételes megjelenítése.
- `src/routes/beszerzesek.tsx`: `ApprovalCard` kiegészítése "kire vár" sorral és a gazdasági vezetői sürgetés gombbal; a lapok tetejére szerepkörfüggő "Rám vár" lista; új statisztikacsempe; a `pendingApprovals` számláló a normalizált státuszra épül.
- `src/lib/store.tsx`: `nudgePlanSubmission(approvalId)` művelet – auditbejegyzés és értesítés az eszközmenedzsernek, státuszváltoztatás nélkül.
- `src/lib/i18n/dictionary.ts`: az új feliratok angol fordítása.
- `roadmap.md`: a feladat felvétele a nyitott tételek közé.
