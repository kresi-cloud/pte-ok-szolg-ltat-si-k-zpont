# Dékáni betekintési jogkör (read-only) a delegált ügykörökben

## Cél

A dékán minden aloldalt megnyithat és minden adatot lát, de azokon a területeken, amelyek nem az ő döntési köre (jogosultságkezelés, eszközátadás, selejtezés, adminisztráció, tervezés, ügyintézés), csak betekintési joga van: a műveleti gombok és űrlapmezők inaktívak.

## Mit tarthat meg a dékán tényleges döntésként

- Beszerzési terv dékáni jóváhagyása a Beszerzői munkatérben (jóváhagyás / visszaküldés a „Dékáni jóváhagyás" fázisban).
- Azok az igény-jóváhagyások, ahol a jóváhagyói láncban ténylegesen ő a soron következő döntéshozó (Jóváhagyási sor, Igény részletei).

Minden más művelet (jogosultság mentése, eszközátadási checklist és átadás, selejtezési javaslat készítése/döntése, tervtételek szerkesztése, státuszváltás a munkatéren, adminisztrációs beállítások, közlemények, leltárjóváhagyás) csak megtekinthető.

## Egységes megoldás

1. Új segédmodul (`src/lib/access.ts`): egy `useViewOnly(area)` / `isViewOnly(role, area)` függvény, amely területenként megmondja, hogy az aktuális szerepkör csak betekintő-e. A dékán minden területen betekintő, kivéve a fenti két saját döntési pontot.
2. Új komponens (`src/components/view-only-notice.tsx`): egységes, jól látható sáv az oldal tetején – „Dékáni betekintés – csak olvasható nézet”, a jelenlegi `/jogosultsagok` megoldás mintájára.
3. Az érintett oldalakon a művelet-indító elemek `disabled` állapotba kerülnek betekintő módban, a listák, kártyák, előzmények és auditnaplók változatlanul láthatók maradnak.

## Érintett oldalak

- `/jogosultsagok` – már read-only dékánnak; átáll a közös komponensre.
- `/eszkozatadas` – checklist, gyári szám / leltárkód mezők, fájlfeltöltés, átadás gomb letiltva.
- `/selejtezes` – javaslat létrehozása, beküldés, jóváhagyás/visszaküldés letiltva.
- `/beszerzesek` – szerkesztés, továbbítás, átadás, végrehajtás letiltva; a „Dékáni jóváhagyás" lépés gombjai aktívak maradnak.
- `/beszerzesi-terv` – tételek hozzáadása, törlése, mezőmódosítás letiltva.
- `/munkater` – státuszváltás, hozzárendelés letiltva.
- `/adminisztracio` – katalógus, felhasználók, közlemények, leltárjóváhagyás letiltva; demó-visszaállítás is.
- `/igeny/$id` – státuszváltás, belső üzenet, AI-besorolás megerősítése letiltva; a jóváhagyó gombok csak akkor aktívak, ha a dékán a soron következő jóváhagyó. A belső adatok, auditlánc továbbra is teljesen láthatók.
- `/jovahagyasok` – csak a dékánra váró tételeknél aktív a döntés.

## Technikai megjegyzések

- A tiltás UI-szinten és a store-hívások előtti őrfeltétellel is érvényesül, hogy a nézet ne kerülhessen ki adatmódosítás.
- A navigáció nem változik: a dékán továbbra is minden menüpontot lát.
- A betekintő sáv szövege bekerül a magyar/angol szótárba (`src/lib/i18n/dictionary.ts`).
