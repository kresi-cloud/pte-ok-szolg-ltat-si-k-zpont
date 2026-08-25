# Superuser megszüntetése és jogosultsági rend rendbetétele

## Cél

A „Superuser (jogosultságkezelő)” szerepkör megszűnik, feladatköre (szerepkörök kiosztása, visszavonása, jogosultsági napló) az **Admin**hoz kerül. A szerepkör megjelenő neve „Rendszeradminisztrátor” helyett mindenhol **Admin**. Emellett minden szerepkör csak azokat az aloldalakat látja, amelyek a feladatköréhez tartoznak; a vezetők látják az áttekintő felületeket, a dékán mindent.

## 1. Superuser kivezetése

- A `superuser` szerepkör törlése a szerepkör-listából, a címkékből és a leírásokból.
- A Rendszeradminisztrátor leírása kiegészül: rendszerbeállítások, katalógus, leltárjóváhagyás **és felhasználói jogosultságok kiosztása**.
- A „Jogosultságkezelés” oldal (`/jogosultsagok`) ezentúl `admin` (és megtekintésre `dekan`) jogkörrel érhető el; a korlátozó szövegek superuser helyett rendszeradminisztrátort említenek.
- Az Adminisztráció oldal utaló szövege is frissül.
- A demó „superuser” felhasználó megszűnik a bejelentkező képernyőn és a felhasználóváltóban; a jogosultságkezelést a meglévő rendszeradminisztrátor demó felhasználó végzi.
- Az érintett magyar–angol szótári bejegyzések frissülnek.

## 2. Új hozzáférési mátrix

Mindenki számára: Kezdőlap, Új igény, Igényeim, Személyi leltár, Segítség.

| Aloldal | Ki látja |
| --- | --- |
| Szolgáltatások, Fejlesztések | igénylő, jóváhagyó, ügyintéző, szolgáltatásgazda, kari vezető, dékán, admin |
| Jóváhagyási sor | jóváhagyó, ügyintéző, szolgáltatásgazda, kari vezető, dékán |
| Szolgáltatási munkatér | ügyintéző, szolgáltatásgazda, dékán |
| Fejlesztési portfólió | ügyintéző, szolgáltatásgazda, kari vezető, dékán |
| Vezetői áttekintés | kari vezető, dékán, szolgáltatásgazda, gazdasági vezető |
| Eszközkataszter | eszközmenedzser, helyi IT referens, beszerző, gazdasági vezető, kari vezető, dékán, admin |
| Beszerzői munkatér | beszerző, eszközmenedzser, gazdasági vezető, dékán |
| Beszerzési terv | eszközmenedzser, beszerző, gazdasági vezető, kari vezető, dékán |
| Eszközátadás | helyi IT referens, eszközmenedzser, beszerző, dékán |
| Selejtezési javaslat | eszközmenedzser, gazdasági vezető, dékán |
| Életciklus-előrejelzés | eszközmenedzser, gazdasági vezető, szolgáltatásgazda, kari vezető, dékán |
| Szolgáltatások és felelősségek | szolgáltatásgazda, admin, dékán |
| Adminisztráció | admin, dékán |
| Jogosultságkezelés | admin (dékán megtekintésre) |

Így kikerülnek a mostani felesleges kombinációk: a jóváhagyó és az ügyintéző nem kap eszközkatasztert, az admin nem lát beszerzési munkateret/tervet, a jóváhagyó nem lát vezetői áttekintést, az áttekintő és beszerzési oldalak pedig nem jelennek meg olyan szerepköröknél, amelyeknek nincs ott feladatuk.

## 3. Technikai lépések

- `src/lib/types.ts`: `superuser` eltávolítása a `RoleKey`-ből, `ROLE_LABELS`-ből, `ROLE_DESCRIPTIONS`-ből; admin leírás bővítése.
- `src/lib/seed.ts`, `src/lib/demo-users.ts`: `u-superuser` demó felhasználó törlése.
- `src/components/app-shell.tsx`: a `NAV` tömb `roles` listái a fenti mátrix szerint.
- Oldal-szintű őrök frissítése ugyanezzel a listával: `src/routes/jogosultsagok.tsx` (admin/dékán), `src/routes/selejtezes.tsx`, `src/routes/eszkozatadas.tsx`, `src/routes/beszerzesek.tsx`.
- `src/routes/jogosultsagok.tsx`: a kiosztható szerepkörök közül a superuser kikerül, a szövegek átírása; dékán esetén csak olvasható nézet.
- `src/routes/adminisztracio.tsx`: superuser-hivatkozás átírása.
- `src/lib/i18n/dictionary.ts`: érintett kulcsok cseréje.
- Ellenőrzés: build + szerepkörönkénti gyors navigációs teszt (menü tartalma és a védett oldalak elutasítása).
