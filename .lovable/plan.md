# Inaktív kezdőlap-csempék visszaállítása

A kezdőlapon jelenleg csak az „Informatikai eszköz" csempe aktív, a többi (Szoftver, Honlap és webes megjelenés, Digitalizáció) inaktív, „Hamarosan elérhető" állapotban látszik. A felhasználó kéri, hogy minden csempe újra kattintható legyen.

## Változtatások

1. **Kezdőlap csempék (`src/routes/index.tsx`)**
   - A másodlagos csempék (`SECONDARY_DOMAINS`) is legyenek `Link` komponensek, amelyek az `/uj-igeny` oldalra navigálnak a megfelelő `domain` keresőparaméterrel.
   - Távolítsuk el az `aria-disabled="true"`, `pointer-events-none`, `opacity-50`, `select-none` stílusokat.
   - Adjunk vissza hover állapotot és vizuális kiemelést.
   - A „Hamarosan elérhető" szöveg helyett vagy mellett jelenjen meg a domén rövid leírása.
   - Az „Informatikai eszköz" csempe maradjon az első, kiemelt helyen.

2. **Bevezető szöveg**
   - A „Jelenleg informatikai eszköz igénylése indítható" szöveget cseréljük semleges, minden domént megcélzó szövegre (pl. „Válasszon területet az igénylés indításához").

3. **Egyéb érintett szövegek**
   - Ha a Segítség vagy más oldalon szerepel olyan megfogalmazás, amely a jelenlegi korlátozásra utal, azt is igazítsuk vissza.

## Nem változik

- Az `/uj-igeny` varázsló továbbra is csak az informatikai eszköz domént támogatja teljes folyamattal; a többi doménre érkező igénylés a meglévő kezelést kapja.
- A menüsávban továbbra sem lesz külön „Új igény" pont, mert az egyetlen belépőpontos modell megmarad.
