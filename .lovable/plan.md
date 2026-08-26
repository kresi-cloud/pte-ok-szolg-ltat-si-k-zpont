# Selejtezési jelöltlista – munkavállaló és helyiség oszlop

A `/selejtezes` oldal „Új javaslat összeállítása” táblázatában a Szervezeti egység oszlop után két új oszlop jelenik meg.

## Mit látunk majd

- **Munkavállaló**: személyi használatú eszköznél a hozzárendelt használó neve; közös használatú eszköznél a leltárfelelős neve „(leltárfelelős)” jelöléssel.
- **Használat / helyiség**: személyi használatú eszköznél „Személyes használat”, közös használatúnál a csatolt helyiség „Épület · Szoba” formában. Ha nincs adat, „—”.

## Technikai részletek

- Csak `src/routes/selejtezes.tsx` módosul (a jelöltek táblázatának fejléce és sorai).
- Név: `a.usage === "szemelyi" ? a.assignedUserId : (a.custodianUserId ?? a.inventoryResponsibleId)`, feloldás `lookup.user(...)?.name` segítségével.
- Helyiség: `assetLookup.locationLabel(a.locationId)` (már importált modul).
- Nincs adatmodell- vagy üzleti logikai változás; a jóváhagyott javaslat selejtlistája változatlan marad (ott már szerepel a munkavállaló neve).
