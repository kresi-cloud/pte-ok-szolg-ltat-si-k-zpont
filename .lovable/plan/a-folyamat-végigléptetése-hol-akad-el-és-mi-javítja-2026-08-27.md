# A folyamat végigléptetése – hol akad el és mi javítja

## Amit teszteltem

Végigkövettem a teljes láncot (igény → jóváhagyás → beszerzési tervsor → gazdasági ellenőrzés → dékáni jóváhagyás → beszerzés → átadás → leltár), és a tervsor-generálást éles kóddal, valós katalógus-címekkel lefuttattam. Ez az eredmény:

```text
Notebook igénylés – Dell Latitude     → tervsor létrejön
Okostelefon igénylés – iPhone 16      → NEM jön létre tervsor
Tablet igénylés – iPad Air            → NEM jön létre tervsor
Kijelző igénylés – Dell U2723         → NEM jön létre tervsor
Nyomtató / Perifériák                 → NEM jön létre tervsor
```

(A 300 000 Ft feletti eszközök egy másik, ártól függő feltétel miatt átcsúsznak – ezért működött néha, néha nem.)

## 1. Fő ok: a jóváhagyott igény nem kerül be a beszerzési tervbe

A jóváhagyás után a rendszer szabad szöveges kulcsszókeresés alapján dönti el, hogy kell-e beszerzés. A katalógusból indított igénylés címe és leírása viszont a termékkör nevét tartalmazza („Okostelefon”, „Kijelző”…), ami nincs a kulcsszólistában. Így a jóváhagyott igény „Elfogadva” állapotban marad, tervsor nem születik, a beszerzőnél soha nem jelenik meg – innentől nincs mit végigléptetni.

Javítás: ha az igény termékkatalógusból indult (van termékköre/terméke), mindig keletkezzen tervsor, ártól és kulcsszavaktól függetlenül. A kulcsszavas találgatás csak a szabad szöveges igényeknél maradjon meg tartalékként.

## 2. A tervsor rossz eszközt visz tovább

A tervsor jelenleg kulcsszóból tippel hardverstandardot: iPhone-ból „Irodai notebook” lesz, és ez a név megy tovább az átadási lapra és a leltárba is. A kiválasztott konkrét terméket kell átvinni (név, gyártó, referenciaár, darabszám), a standard csak akkor legyen tipp, ha nincs katalógustermék.

## 3. Nincs kézi javítási lehetőség

Ha a kapcsolat egyszer nem jött létre, semmilyen felületen nem pótolható. Az igény adatlapjára kerül egy művelet a beszerzőnek/eszközmenedzsernek: **„Beszerzési tervsor létrehozása ebből az igényből”**, ha az igény elfogadott és még nincs hozzá tervsor. Ezzel a már beragadt igényei (pl. a most nyitott HW-2026-0566) is továbbléptethetők.

## 4. Az utolsó lépés nem oda érkezik, ahol keresik

Az átvétel visszaigazolása után az eszköz a „Saját bejelentés – hardver” listába kerül, nem a „Rám rendelt eszközök” közé, mert az intézményi eszköznyilvántartásba nem íródik be semmi. Az átvételkor jöjjön létre intézményi eszközrekord is az igénylőhöz rendelve (gyári szám, leltárkód, épület/helyiség), így a lánc vége is ott jelenik meg, ahol logikus.

## 5. Kisebb elakadások, amiket érdemes egyszerre rendezni

- Az átadási lapon az „Átadás az igénylőnek” gomb néma módon tiltott, amíg nincs gyári szám, leltárkód, kipipált kötelező lista és **fotó**. Legyen látható felsorolás arról, mi hiányzik még.
- A dékáni jóváhagyás után a tervsor csak akkor indul beszerzésbe, ha a negyedév/ütemezés pontosan egyezik a jóváhagyási ciklussal; egyébként némán kimarad. A tételhez tartozó jóváhagyás alapján kell léptetni.
- Ha egyetlen IT referens sincs az adott szervezeti egységben, az átadás megreked. Marad a tartalék hozzárendelés, de figyelmeztetés jelenjen meg a beszerzői felületen.
- A tesztelés megkönnyítésére az igény adatlapjára kerül egy kis „Folyamat állapota” sáv: igény → jóváhagyás → tervsor → terv jóváhagyás → beszerzés → átadás → leltár, jelezve, ki a soron következő szereplő. Ez nélkül a kézi végigléptetés találgatás.

## Technikai részletek

- `src/lib/request-procurement.ts`: `needsProcurement` – `productCategoryId`/`productId` esetén mindig `true`; `planItemFromRequest` – a termék adatai (név, referenciaár, mennyiség) elsődlegesek a kulcsszavas standard-tippel szemben, a tervsor kapjon `deviceName`-et.
- `src/lib/store.tsx`: `applyProcurementLink` új művelettel exportálva (`createPlanItemFromRequest`); `startPlanExecution` a tételhez tartozó `PlanApproval` alapján léptessen; `confirmHandoverReceipt` az `inventory` mellett `assets` rekordot is hozzon létre `assignedUserId`-vel.
- `src/routes/igeny.$id.tsx`: folyamat-állapotsáv + „Beszerzési tervsor létrehozása” gomb (beszerző/eszközmenedzser, elfogadott igény, nincs tervsor).
- `src/routes/eszkozatadas.tsx`: hiányzó feltételek felsorolása az átadás gomb mellett.
- `src/routes/beszerzesek.tsx`: figyelmeztetés hiányzó IT referens esetén.
- `src/lib/i18n/dictionary.ts` / `overrides.ts`: új feliratok angol fordítása.
