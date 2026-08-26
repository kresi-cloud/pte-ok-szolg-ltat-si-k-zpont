# Meglévő hasonló eszköz jelzése az igénylésnél

Cél: ha az igénylőnek már van a kért termékkörhöz illeszkedő eszköze a leltárában, ez egy keretes tájékoztató sávban jelenjen meg — az igénylés varázslójában és az elsődleges jóváhagyó nézetében is.

## Mit lát a felhasználó

Az `/uj-igeny` oldalon, a termékkör kiválasztása után (a modellválasztás, adatlap, részletek és összegzés lépésekben is) egy figyelmeztető stílusú, keretes doboz — a főoldali „Hírek” blokk vizuális nyelvén:

- Szöveg: „Ön jelenleg is rendelkezik ilyen típusú eszközzel” + a megtalált eszközök felsorolása: megnevezés (gyártó/modell), leltári szám, üzembe helyezés dátuma, állapot, valamint hogy személyes használatban vagy felelősként kezeli.
- Nem blokkolja az igénylést, csak tájékoztat; nem elrejthető.

Az igény adatlapján (`/igeny/$id`) ugyanez a doboz jelenik meg az elsődleges (szervezeti) jóváhagyó számára, az igénylő nevére fogalmazva: „Az igénylő jelenleg is rendelkezik ilyen típusú eszközzel”. A jóváhagyó a költségkeret rögzítése mellett látja ezt, a döntést nem korlátozza.

## Illeszkedési szabály

Az igényben rögzített termékkör (pl. Okostelefon) leképezése a leltári eszközkategóriákra, majd az igénylőhöz kötött aktív eszközök szűrése:

- személyi használatú kör esetén: az igénylőhöz rendelt eszközök (`assignedUserId`),
- közös használatú kör esetén: az igénylő által felelősként kezelt eszközök is (`custodianUserId`).

Selejtezett/inaktív eszköz nem számít.

## Technikai részletek

- Új helper `src/lib/product-catalog.ts` mellé (vagy külön `similar-assets.ts`): termékkör-azonosító → `AssetCategoryKey` leképezés (`pc-notebook`→`notebook`, `pc-desktop`→`asztali`, `pc-workstation`→`munkaallomas`, `pc-okostelefon`/`pc-mobiltelefon`→`mobil`, `pc-tablet`→`tablet`, `pc-monitor`→`monitor`, `pc-periferia`→`periferia`, `pc-nyomtato`→`nyomtato`, `pc-projektor`→`egyeb`), plusz `similarAssetsFor(assets, userId, categoryId, personalUse)`.
- Új megjelenítő komponens `src/components/similar-asset-notice.tsx`, az `AnnouncementsBanner` „figyelmeztetes” stílusát követve (`border-warning/40 bg-warning/10`, `TriangleAlert` ikon), nem elrejthető. Props: eszközlista + megszólítás módja (saját / igénylő).
- `src/routes/uj-igeny.tsx`: a hardver ág lépéseiben a kiválasztott termékkör alapján rendereli a komponenst az aktuális felhasználó leltárára.
- `src/routes/igeny.$id.tsx`: az elsődleges jóváhagyó szakaszában (a költségkeret blokk közelében) ugyanez, az igény `productCategoryId` mezője és az igénylő azonosítója alapján.
- Csak megjelenítés, nincs adatmodell-változás és nincs hatás a jóváhagyási logikára.
