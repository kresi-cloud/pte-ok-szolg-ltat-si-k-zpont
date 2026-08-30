# Egy igénylés teljes útja: termékbevezetéstől a selejtezés jóváhagyásáig

Levezetés a jelenlegi rendszer alapján, konkrét esetben: egy notebook igénylésén végigkövetve, aki azt lecseréli és a régit selejtezi.

## 0. Termék bevezetése a rendszerbe (Beszerző)

```text
Beszerző -> Adminisztráció / termékkatalógus
  -> termékkör (pl. "Notebook") + konkrét termék felvitele
  -> adatlap: név, gyártó, referenciaár, műszaki specifikáció, modelKey
  -> elérhetőség kiosztása munkavállalói kategóriánként:
     alkalmazotti / vezetői / felsővezetői
```

- A termék csak akkor törölhető, ha nincs rá hivatkozó aktív igény, tervsor vagy folyamatban lévő eszközátadás.
- A jogosultságkezelésben minden felhasználó megkapja a saját kategóriáját, így a varázsló csak a számára engedélyezett termékeket mutatja.

## 1. Igénylés (Igénylő)

```text
Kezdőlap -> "Informatikai eszköz" csempe
  -> 1 Termékkör: csempe kattintásra azonnal léptet
  -> 2 Modell: a saját kategóriájában elérhető, beszerezhető termékek
  -> 3 Részletek: indok, személyi/munkahelyi használat, prioritás
```

- Ha az igénylő leltárában van a termékkörhöz hasonló eszköz, figyelmeztetés jelenik meg (az elsődleges jóváhagyónál is).
- Személyi használatú eszköznél a mennyiség 1, a felesleges kérdések (mire használná, kik használják, hol használják, határidő, egyszeri/tartós) nem jelennek meg.
- Ha cseréről van szó, az igény rögzíti a lecserélt eszköz azonosítóját (`replacedAssetId`) – ez lesz később a selejtezés kiindulása.

## 2. Elsődleges jóváhagyás (Szervezeti jóváhagyó, majd Szolgáltatásgazda)

```text
Igény "fuggoben" -> jovahagyasok oldal -> döntés + megjegyzés (+ költség)
```

- A jóváhagyási lépések az igény `approvals` listájában, döntéssel, időbélyeggel és megjegyzéssel rögzülnek; minden lépés audit-naplóba és értesítésbe kerül.
- Elutasításnál itt véget ér az ügy ("elutasitva").
- Az igénylő a gazdasági vezetői jóváhagyásáig bármikor visszavonhatja az igényt ("visszavonva"), ami a historyban látható marad.

## 3. Beszerzési tervsor automatikus létrejötte

Amint az igény jóváhagyott (`needsProcurement`: katalógusos eszközigény esetén mindig igaz):

```text
planItemFromRequest(igény, katalógus)
  -> tervsor: a kiválasztott termék neve + gyártója, referenciaár, darabszám
  -> negyedév a prioritásból: kritikus/magas -> Q1, közepes -> Q2, alacsony -> Q3
  -> kind: "csere" (ha van replacedAssetId) vagy "uj_kapacitas"
  -> status: "jovahagyasra_var"
```

A kulcsszavas hardverstandard-becslés csak szabad szöveges igénynél tartalék. Ha a kapcsolat valamiért nem jött létre, az igény adatlapján kézzel pótolható („Beszerzési tervsor létrehozása").

## 4. Terv összeállítása és jóváhagyási lánc

```text
IT eszközmenedzser  -> tervsor negyedéves/éves/azonnali ciklusba sorolása, beküldés
Gazdasági vezető    -> ellenőrzés, módosítás, továbbítás
Dékán               -> jóváhagyás (negyedéves: 30 nappal, éves: 60 nappal az esedékesség előtti határidő)
```

- A jóváhagyási ciklusokat a `buildPlanApprovals` hozza létre a tervezési évre (azonnali + éves + Q1–Q4), mindegyik határidővel.
- A dékáni jóváhagyás után a tétel a hozzá tartozó jóváhagyás alapján lép tovább – nem a negyedév-egyezés alapján.

## 5. Beszerzés végrehajtása (Beszerző)

```text
Beszerző -> beszerzés indítása ("beszerzes_alatt")
         -> beérkezés jelölése ("Beérkezett – átadásra")
```

- Ekkor automatikusan létrejön az `AssetHandover` rekord, állapota: `beerkezett`.

## 6. Telepítés és átadás (IT referens)

```text
Eszközátadás munkatér:
  beerkezett -> elokeszites_alatt -> atadasra_kesz -> atadva
```

- A referens rögzíti: gyári szám, PTE leltárkód, telepített OS/verzió.
- A katalógusból választja ki az eszközmodellt (csak a termékkörhöz tartozó, aktuálisan beszerezhető tételek).
- Kötelező: 11 pontos ellenőrzőlista + fotó; nem mobil eszköznél épület/helyiség (alapértelmezetten az igénylő saját irodája/műhelye/laborja).
- A gomb mellett látható, mi hiányzik még.

## 7. Átvétel visszaigazolása (Igénylő)

```text
Igénylő -> igény adatlapja vagy Személyi leltár -> "Átvétel visszaigazolása"
  atadva -> atvetel_igazolva
```

A visszaigazoláskor a rendszer automatikusan:
- létrehozza a személyi leltártételt és az intézményi eszközrekordot (`assets`), a katalógustételből: megnevezés, modell (név + gyártó), teljes műszaki adatlap, gyári szám, leltárkód, épület/helyiség;
- az igény állapotát „teljesült"-re, a tervsort „teljesült"-re állítja;
- audit + értesítés minden lépésnél.

## 8. Élettartam és selejtezési javaslat (IT eszközmenedzser)

```text
Selejtezés oldal -> javaslatlista a könyv szerinti érték alapján
  bookValue = beszerzési ár - (20% / év lineáris amortizáció)
  -> hordozható eszköz (notebook/tablet/mobil): személyes használat jelölés
  -> nem hordozható: épület/helyiség jelenik meg
```

- A táblázat soronként: szervezeti egység, munkavállaló neve, csatolt helyiség vagy személyes használat.
- Az eszközmenedzser javaslatot állít össze (`createScrapProposal`, státusz: „tervezes"), majd beküldi (`submitScrapProposal` -> „gazdasagi_jovahagyasra_var", értesítés a gazdasági vezetőnek).

## 9. Selejtezés jóváhagyása (Gazdasági vezető)

```text
Gazdasági vezető -> jóváhagyja -> status: "jovahagyva", a tételek felkerülnek a selejtlistára
                 -> vagy visszaküldi átdolgozásra
```

- A kész selejtlista .xlsx formátumban exportálható.
- A jóváhagyás ténye, ideje és döntője a javaslat `history` mezőjében auditálva.

## A teljes lánc egy pillantásra

```text
Beszerző          termék + termékkör + kategória-elérhetőség
Igénylő           varázsló: termékkör -> modell -> részletek
Jóváhagyó/Gazda   elsődleges jóváhagyás (audit + értesítés)
  (rendszer)      tervsor automatikusan a katalógustételből
Eszközmenedzser   tervsor ciklusba sorolása, beküldés
Gazdasági vezető  ellenőrzés, továbbítás
Dékán             terv jóváhagyása (30/60 napos határidő)
Beszerző          beszerzés indítása, beérkezés
IT referens       gyári szám, leltárkód, checklist, fotó, átadás
Igénylő           átvétel visszaigazolása -> leltár + eszközrekord
Eszközmenedzser   selejtezési javaslat (20%/év amortizáció)
Gazdasági vezető  selejtezés jóváhagyása -> selejtlista + xlsx export
```

Minden szereplő a saját munkaterületén látja a soron következő lépést, az igény adatlapján a „Folyamat állapota" sáv mutatja, hol tart az ügy, és a jogosult szerepkörök azt is, konkrétan kinél.

*Ez a dokumentum leírást tartalmaz, kódmódosítást nem.*
