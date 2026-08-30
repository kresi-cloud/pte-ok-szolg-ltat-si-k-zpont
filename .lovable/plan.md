# Igényelt beszerzési ütemezés az igénylőnél

Az igénylő a "3 Részletek" lépésben megadja, melyik negyedévre kéri a beszerzést. A lista utolsó eleme az "Azonnali beszerzés", amelyhez kötelező indoklás tartozik. A választás javaslatként megy tovább a folyamatban: a jóváhagyott igényből generált beszerzési tervsor ezt az ütemezést kapja meg, de a beszerző és a gazdasági vezető továbbra is felülírhatja.

## Amit az igénylő lát

- Új kérdés: "Melyik negyedévre kéri a beszerzést?" – legördülő menüben I., II., III., IV. negyedév, majd utolsó opcióként "Azonnali beszerzés (indoklás szükséges)".
- Azonnali választás esetén megjelenik egy kötelező "Az azonnali beszerzés indoka" mező (min. 10 karakter); enélkül a beküldés nem engedélyezett.
- A választás bekerül az igény összegzésébe és leírásába, így a jóváhagyó és a beszerző is látja.

## Amit a döntéshozók látnak

- Az igény részletei oldalon külön soron jelenik meg az igényelt ütemezés és – ha van – az azonnali indoklás.
- A jóváhagyott igényből képzett beszerzési tervsor az igényelt negyedévet kapja célnegyedévnek, azonnali kérés esetén pedig azonnali bontást; a comment mezőbe bekerül az igénylő indoklása.
- A gazdasági vezető ütemezés-blokkja változatlanul felülírhatja a javaslatot.

## Technikai részletek

- `src/lib/types.ts`: `ServiceRequest` bővítése `requestedQuarter?: Quarter | "azonnali"` és `urgencyReason?: string` mezőkkel, valamint egy `REQUESTED_TIMING_LABELS` felirattérkép.
- `src/routes/uj-igeny.tsx`: új select + feltételes indoklás mező a details lépésben; a `canContinue`/beküldés validáció kiegészítése; a mezők átadása a `createRequest` hívásban és beépítése a generált `hwGoal` szövegbe.
- `src/lib/request-procurement.ts`: `quarterFor()` helyett elsődlegesen az igény `requestedQuarter` értéke határozza meg a `quarter` mezőt; `azonnali` esetén `timing: "azonnali"` és Q1 célnegyedév, egyébként `timing: "negyedeves"`; az indoklás a `comment` szövegbe kerül.
- `src/routes/igeny.$id.tsx`: az igényelt ütemezés és indoklás megjelenítése az adatblokkban.
- `src/lib/i18n/dictionary.ts`: az új feliratok angol fordítása.
