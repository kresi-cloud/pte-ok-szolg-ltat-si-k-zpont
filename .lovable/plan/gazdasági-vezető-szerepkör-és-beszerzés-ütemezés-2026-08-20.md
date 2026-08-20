# Gazdasági vezető szerepkör és beszerzés-ütemezés

## Cél
Új felhasználói szerepkör: **Gazdasági vezető**. Ő az, aki a beérkező azonnali (eseti) beszerzési igényeket egy évre előre, tetszőlegesen negyedéves tervblokkokba sorolhatja át.

## Mit építünk

### 1. Új szerepkör
- Új szerepkulcs: „Gazdasági vezető”, saját leírással a szerepkör-listában.
- Új demó felhasználó (Dékáni Hivatal / Gazdasági Igazgatóság), aki a bejelentkező képernyőn kiválasztható.
- Jogosultságkezelés (superuser felület) és a jogosultsági mátrix kiegészítése az új szereppel.

### 2. Menü és hozzáférés
- A gazdasági vezető eléri a Beszerzői munkateret, a Beszerzési tervet, valamint a vezetői/kari áttekintést (olvasás).
- A meglévő beszerzői jogosultságok nem változnak.

### 3. Ütemezés az „Eseti beszerzések” fülön
Minden eseti (jóváhagyott igényből keletkezett) tételnél a gazdasági vezető számára megjelenik egy ütemező vezérlő:
- Célblokk választása: az aktuális és a következő pénzügyi év négy-négy negyedévéből, összesen 12 hónapnyi (egy évre előre eső) blokkokból.
- „Azonnali” állapotban tartás vagy tervblokkba sorolás egy kattintással.
- Az áthelyezés a tétel tervévét és negyedévét írja át, és naplóbejegyzést hoz létre (ki, mikor, honnan hová, opcionális indoklás).
- Tömeges művelet: több kijelölt tétel egyszerre mozgatható ugyanabba a negyedévbe.

### 4. Visszajelzés
- A tétel sorában látszik az aktuális tervblokk és hogy „gazdasági vezető által átütemezve”.
- A negyedéves fülön a tételek azonnal a helyükre kerülnek, a keretösszegek újraszámolódnak.
- A dékáni jóváhagyás logikája változatlan: az átütemezett tétel a célnegyedév jóváhagyási ciklusába kerül.

## Technikai részletek
- `src/lib/types.ts`: `RoleKey` bővítése `gazdasagi_vezeto` kulccsal, címke + leírás.
- `src/lib/seed.ts`: új demó user (`u-gazdvez`), szerepkörrel.
- `src/components/login-screen.tsx`: demó belépési lista bővítése.
- `src/components/app-shell.tsx`: navigációs jogosultságok.
- `src/routes/jogosultsagok.tsx` és `src/routes/felelossegek.tsx`: új szerep megjelenítése.
- `src/lib/store.tsx`: `reschedulePlanItem(id, planYear, quarter, comment?)` művelet, ami a `planYear`/`quarter` mezőt írja és auditbejegyzést fűz hozzá.
- `src/routes/beszerzesek.tsx`: ütemező UI (Select + tömeges művelet) a gazdasági vezető szerepnél, `canAct` kiterjesztése.
- `src/lib/i18n/dictionary.ts`: új magyar szövegek angol fordítása.
