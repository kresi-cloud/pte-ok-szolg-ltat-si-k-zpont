# Igény visszavonása az igénylő által

## Cél
Az igénylő bármelyik saját igényét visszavonhassa – egészen addig, amíg a hozzá tartozó beszerzést a gazdasági vezető jóvá nem hagyta (tovább nem küldte dékáni jóváhagyásra).

## Mikor lehet visszavonni
Visszavonható, ha az igény nem lezárt, nem elutasított és nem már visszavont, ÉS
- nem keletkezett belőle beszerzési tervsor, vagy
- a tervsor még olyan tervciklusban van, amelyet a gazdasági vezető még nem továbbított (állapot: beszerzői tervezés alatt, gazdasági ellenőrzés alatt, vagy átdolgozásra visszaküldve).

Nem vonható vissza, ha a terv már dékáni jóváhagyásra került, jóváhagyták, végrehajtás alatt van, vagy a tétel már beszerzés alatt / teljesült, illetve ha eszközátadás indult.

## Mit épül
1. Új igénystátusz: „Visszavonva” – saját, semleges színű jelöléssel, a lezárt igények között listázva.
2. Az igény adatlapján (`/igeny/$id`) az igénylőnek megjelenik egy „Igény visszavonása” gomb, megerősítő párbeszédablakkal és opcionális indoklással. Ha a visszavonás már nem lehetséges, a gomb helyett rövid magyarázó sor jelenik meg (miért nem).
3. Az „Igényeim” listában soronként is elérhető a visszavonás ugyanezzel a szabállyal.
4. Visszavonáskor:
   - az igény státusza „Visszavonva”, a függőben lévő jóváhagyási lépések lezárulnak (tárgytalan),
   - a kapcsolódó, még nem jóváhagyott beszerzési tervsor kikerül a tervből,
   - auditbejegyzés és értesítés keletkezik (ki, mikor, indoklás),
   - a beszerzői/eszközmenedzseri munkatérből eltűnik a tétel.
5. HU/EN szövegek.

## Technikai részletek
- `src/lib/types.ts`: `StatusKey` bővítése `visszavonva` értékkel (címke, sorrend, státuszszín).
- `src/lib/store.tsx`: új `withdrawRequest(id, reason?)` művelet – státuszváltás, függő approval-ok lezárása, `planItems` szűrése `sourceRequestId` alapján, audit + notification. Új segédfüggvény `canWithdrawRequest(state, request)` a fenti szabállyal (tervsor → `planApprovals` állapot megfeleltetés a `planYear`/`quarter`/`timing` alapján, ahogy a `startPlanExecution` teszi).
- `src/routes/igeny.$id.tsx`: visszavonó blokk az igénylőnek (`request.requesterId === currentUser.id`), `AlertDialog` megerősítéssel.
- `src/routes/igenyeim.tsx`: sor szintű visszavonás, a „lezárt” fül szűrője kiegészül a `visszavonva` státusszal.
- `src/components/status-badge.tsx`: új státusz megjelenítése.
- `src/lib/i18n/dictionary.ts`: új szövegek fordítása.
