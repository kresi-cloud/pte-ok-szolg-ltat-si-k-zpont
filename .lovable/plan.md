# „Egyszeri vagy tartós?” kérdés törlése

Az igénylési űrlap „3. Részletek” lapjáról teljesen eltűnik az **„Egyszeri igényről vagy tartós szolgáltatásról van szó?”** kérdés – minden eszköztípusnál, nem csak a személyi használatúaknál.

- Eszközigénylésnél a rendszer a háttérben egyszeri igényként kezeli az ügyet, így a beszerzési és jóváhagyási folyamat változatlanul működik.
- Az igény adatlapján a „Jelleg” sor csak akkor jelenik meg, ha van értéke (a korábbi, meglévő igényeknél így megmarad), új igénynél nem jelenik meg üresen.

## Technikai részletek

- `src/routes/uj-igeny.tsx`: a `recurring` rádiócsoport és a hozzá tartozó űrlapmező törlése; a beküldéskor az eszközigény fix „Egyszeri igény” értékkel megy tovább.
- `src/routes/igeny.$id.tsx`: a „Jelleg” sor feltételes megjelenítése.
- `src/lib/i18n/dictionary.ts`: a feleslegessé vált kérdésszöveg fordításának törlése.
