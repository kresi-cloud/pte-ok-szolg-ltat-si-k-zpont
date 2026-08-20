# Gazdasági vezető megjelenítése a felhasználók között

## A probléma

A gazdasági vezető (Rákosfalvi I.) szerepkör és demó felhasználó létezik, és a bejelentkező képernyőn kiválasztható, de a **fejlécben lévő „Demó: felhasználóváltás” listából hiányzik** – ott egy rögzített felhasználólista szerepel, amiből kimaradt ez a felhasználó. Emiatt bejelentkezés után nem lehet rá váltani.

Mellékesen az adata következetlen: a neve „Rákosfalvi I.”, de az e-mail címe még `balogh.ildiko@aok.pte.hu`.

## Megoldás

1. A fejléc felhasználóváltó listájába bekerül a gazdasági vezető is (`src/components/app-shell.tsx`), a beszerző után.
2. A rögzített azonosítólista helyett a lista a bejelentkező képernyőn is használt demó felhasználó-készletből épül fel, hogy jövőbeni új szerepköröknél ne maradjon ki senki.
3. A gazdasági vezető e-mail címe a nevéhez igazodik (`rakosfalvi.i@aok.pte.hu`) a `src/lib/seed.ts`-ben.

## Technikai részletek

- A `DEMO_USERS` azonosítólista a `src/components/login-screen.tsx`-ből közös modulba kerül (pl. `src/lib/demo-users.ts`), és mindkét felület onnan olvassa.
- Nincs adatmodell- vagy jogosultsági változás; a `gazdasagi_vezeto` szerepkör menüi és a Beszerzői munkatér átütemezési funkciója változatlan.
