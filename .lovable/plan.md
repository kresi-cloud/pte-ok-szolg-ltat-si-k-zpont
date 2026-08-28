# Helyiséglista kiegészítése: minden munkatársnak legyen hozzárendelhető iroda, műhely vagy labor

Jelenleg 12 helyiség létezik (`ASSET_LOCATIONS`), és ezek nem fedik le az összes szervezeti egységet (pl. ou-it), sem a munkakörök jellegét — így több munkatárshoz nincs értelmes helyiség, amit az eszközfelvételnél vagy átadásnál választani lehetne.

## Mit csinálunk

1. **Helyiségtípus bevezetése**: minden helyiség kap egy típust — iroda, műhely vagy labor —, ami a listákban is látszik.
2. **Teljes helyiséglista**: minden jelenlegi felhasználóhoz létrejön a munkahelyének (szervezeti egység) és beosztásának megfelelő helyiség. Példák:
   - intézetigazgatók: intézeti igazgatói iroda
   - oktatók/kutatók: oktatói iroda + intézeti labor
   - dékáni hivatal munkatársai (admin, ügyintézők, beszerzés, gazdasági vezető, dékán, dékánhelyettes): saját irodák
   - IT eszközmenedzser és helyi IT referens: IT műhely (szervizhelyiség)
   - oktatásszervezés, kutatástámogatás, klinikai együttműködés: iroda, illetve számítógépes labor
3. **Alapértelmezett helyiség felhasználónként**: minden userhez tartozik egy „saját" helyiség, ami az eszközfelvételi, eszközátadási és igénylési helyiségválasztóknál előre kiválasztódik / a lista elején jelenik meg.
4. **Helyiségleltár nézet**: az Eszközkataszter oldalon új „Helyiségek" fül — épület, helyiség, típus, szervezeti egység, az ott dolgozó munkatársak és a helyiséghez rendelt eszközök száma.

## Technikai részletek

- `AssetLocation` bővítése: `kind: "iroda" | "muhely" | "labor"` és opcionális `primaryUserIds: string[]`.
- `ASSET_LOCATIONS` kibővítése az összes szervezeti egységre (a hiányzó `ou-it` is), minden felhasználóhoz rendelt helyiséggel; a meglévő `loc-*` azonosítók változatlanul maradnak, hogy a meglévő eszközrekordok ne törjenek el.
- Új segédfüggvények az `asset-logic.ts`-ben: `defaultLocationForUser(userId)` és `locationsForUser(userId)` (saját egység helyiségei előre sorolva).
- Helyiségválasztók frissítése: `src/routes/leltar.tsx`, `src/routes/eszkozatadas.tsx`, `src/routes/uj-igeny.tsx` — típussal címkézett opciók, alapértelmezett érték a user saját helyisége.
- Új „Helyiségek" fül a `src/routes/eszkozkataszter.tsx`-ben.
- HU/EN szótárbejegyzések a `src/lib/i18n/dictionary.ts`-ben az új címkékhez.
