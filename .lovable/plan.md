# Hol induljon az igénylés? – javaslat

## Rövid válasz
Mindkettő kell, de eltérő szereppel: a **nyitóoldal az elsődleges indítópont** (döntéstámogató belépő), a menüsáv **„+ Új igény”** pedig gyorsgomb azoknak, akik már tudják, mit akarnak. Ez a bevált mintázat az önkiszolgáló szolgáltatási portáloknál (ServiceNow, Jira SM, Zendesk): "guided catalog on the landing page + persistent quick action".

## Miért a nyitóoldal az elsődleges
- Az alkalmi felhasználó (évente 1-2 igény) nem menüből tájékozódik, hanem a nyitóoldalon látott csempéből. A kontextus (mit lehet igényelni, mi nem érhető el) itt magyarázható el.
- A nyitóoldalon a döntési út első lépése (termékkör) már látható, így kevesebb kattintás és kevesebb megszakadt igénylés.
- A teendők, hírek és a folyamatban lévő igények ugyanitt vannak – az igénylés természetes folytatása ennek a felületnek.

## Miért maradjon a menüpont
- A visszatérő felhasználók (IT referens, eszközmenedzser, gyakori igénylők) minden aloldalról egy kattintással indítanak.
- Mélylinkelhető, megosztható belépési pont (`/uj-igeny`).

## Konkrét változtatások
1. **Nyitóoldal**: az „Informatikai eszköz” csempe hangsúlyos elsődleges CTA-vá válik (nagyobb, teljes szélességű blokk a felső sávban, „Igénylés indítása” gombbal); a többi, jelenleg nem elérhető terület kisebb, halvány másodlagos csempeként marad alatta.
2. **Menüpont**: a „+ Új igény” megmarad, de a jelenlegi redundáns első lépés (terület kiválasztása) kimarad – mivel egyetlen terület aktív, a varázsló rögtön a termékkör-választással indul, ugyanúgy, mint a nyitóoldalról érkezve.
3. **Konzisztens visszatérés**: a varázsló megszakítása („Mégse”) a nyitóoldalra visz, hogy a felhasználó lássa a teendőit.

## Technikai megjegyzések
- `src/routes/index.tsx`: kiemelt hero-jellegű CTA blokk az aktív doménhez, a letiltott csempék másodlagos sorba.
- `src/routes/uj-igeny.tsx`: ha csak egy engedélyezett domén van, a `domain` lépés automatikusan kitöltődik és kimarad a lépéssorból (`stepKeys`, `stepLabels`, kezdő `step`), a Vissza gomb ennek megfelelően viselkedik.
- Nincs adatmodell- vagy jogosultsági változás.
