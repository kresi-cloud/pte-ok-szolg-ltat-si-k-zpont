# Egyetlen indítópont: a nyitóoldali csempe

Egyetértek: alacsony igénylési gyakoriság mellett a két párhuzamos belépő inkább zavaró. A menüsávból kikerül a „+ Új igény”, az igénylés kizárólag a nyitóoldali csempéről indul.

Egy dolgot érdemes megtartani: maga az igénylési varázsló oldala (`/uj-igeny`) megmarad, mert ez a csempe célja – csak menüpontként nem jelenik meg többé. Így a folyamat és a mélylinkek (pl. e-mail értesítésből) sértetlenek maradnak.

## Változtatások
1. **Menüsáv**: a „+ Új igény” menüpont törlése minden szerepkörnél.
2. **Nyitóoldal**: az „Informatikai eszköz” csempe hangsúlyos elsődleges belépővé válik (kiemelt keret, „Igénylés indítása” gomb), hogy egyértelmű legyen: itt indul a folyamat. A többi terület halvány, nem választható marad.
3. **Varázsló**: a megszakítás/„Mégse” és a sikeres beadás után a felhasználó a nyitóoldalra vagy az igény adatlapjára kerül – nincs zsákutca, mivel menüből már nem érhető el az oldal.
4. **Egyéb hivatkozások**: ahol szövegesen „Új igény menüpont” szerepel (pl. Segítség oldal), a megfogalmazás a nyitóoldali csempére utal.

## Technikai megjegyzések
- `src/components/app-shell.tsx`: `/uj-igeny` NAV bejegyzés törlése (a route marad).
- `src/routes/index.tsx`: kiemelt CTA-csempe az aktív doménhez.
- `src/routes/uj-igeny.tsx`: navigációs visszalépések ellenőrzése, egyetlen aktív domén esetén a terület-választó lépés kihagyása.
- `src/routes/segitseg.tsx` és egyéb szöveges említések frissítése, a magyar–angol szótár kiegészítése.
