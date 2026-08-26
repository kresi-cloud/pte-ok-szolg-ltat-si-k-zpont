import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { ArrowLeft, ArrowRight, Boxes, Check, Globe, Laptop, Sparkles, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AiBadge } from "@/components/status-badge";
import { CATALOG, DOMAINS, lookup, useStore } from "@/lib/store";
import type { DomainKey } from "@/lib/types";
import { tierOf, visibleCategories, visibleProducts } from "@/lib/product-catalog";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  domain: fallback(z.string(), "").default(""),
  service: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/uj-igeny")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Új igény indítása – ÁOK Digitális Szolgáltatási Portál" },
      {
        name: "description",
        content:
          "Vezetett igénybejelentés: mondja el, mit szeretne elérni, a rendszer elvégzi a besorolást és az irányítást.",
      },
      { property: "og:title", content: "Új igény indítása – ÁOK Digitális Szolgáltatási Portál" },
      {
        property: "og:description",
        content: "Vezetett igénybejelentés a PTE ÁOK digitális szolgáltatásaihoz.",
      },
    ],
  }),
  component: Wizard,
});

const ICONS: Record<DomainKey, typeof Boxes> = {
  szoftver: Boxes,
  hardver: Laptop,
  web: Globe,
  digitalizacio: Workflow,
};

const STEPS = ["Terület", "Cél", "Részletek", "Összegzés"];
const HW_STEPS = ["Terület", "Termékkör", "Eszköz", "Részletek", "Összegzés"];

interface FormState {
  domain: DomainKey | "";
  catalogItemId: string;
  productCategoryId: string;
  productId: string;
  quantity: string;
  title: string;
  goal: string;
  users: string;
  userCount: string;
  deadline: string;
  existing: string;
  personalData: string;
  integration: string;
  recurring: string;
  budget: string;
  device: string;
  siteUrl: string;
  refined: boolean;
}

const empty: FormState = {
  domain: "",
  catalogItemId: "",
  productCategoryId: "",
  productId: "",
  quantity: "1",
  title: "",
  goal: "",
  users: "",
  userCount: "",
  deadline: "",
  existing: "",
  personalData: "nem",
  integration: "",
  recurring: "tartos",
  budget: "",
  device: "",
  siteUrl: "",
  refined: false,
};

function Wizard() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { createRequest, currentUser, productCategories, products } = useStore();
  const preset = CATALOG.find((c) => c.id === search['service']);
  const skipDomain = !!search['domain'];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    ...empty,
    domain: (search['domain'] as DomainKey) || (preset?.domain ?? ""),
    catalogItemId: preset?.id ?? "",
    title: preset?.name ?? "",
  });

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const domain = form.domain ? lookup.domain(form.domain) : undefined;

  const questions = useMemo(() => contextQuestions(form.domain), [form.domain]);

  const isHw = form.domain === "hardver";
  const allLabels = isHw ? HW_STEPS : STEPS;
  const allKeys: string[] = isHw
    ? ["domain", "category", "product", "details", "summary"]
    : ["domain", "goal", "details", "summary"];
  const stepLabels = skipDomain ? allLabels.slice(1) : allLabels;
  const stepKeys = skipDomain ? allKeys.slice(1) : allKeys;
  const lastStep = stepKeys.length - 1;
  const key = stepKeys[Math.min(step, lastStep)]!;

  const tier = tierOf(currentUser);
  const cats = useMemo(
    () => visibleCategories(productCategories, products, tier),
    [productCategories, products, tier],
  );
  const catProducts = useMemo(
    () =>
      visibleProducts(products, tier).filter((p) => p.categoryId === form.productCategoryId),
    [products, tier, form.productCategoryId],
  );
  const selectedProduct = products.find((p) => p.id === form.productId);
  const selectedCategory = productCategories.find((c) => c.id === form.productCategoryId);

  const canNext =
    (key === "domain" && !!form.domain) ||
    (key === "category" && !!form.productCategoryId) ||
    (key === "product" && !!form.productId) ||
    (key === "goal" && form.goal.trim().length > 20 && form.title.trim().length > 3) ||
    key === "details" ||
    key === "summary";


  const qty = Math.max(1, Number(form.quantity) || 1);
  const hwTitle = selectedProduct
    ? `${selectedCategory?.name ?? "Eszköz"} igénylés – ${selectedProduct.name}${qty > 1 ? ` (${qty} db)` : ""}`
    : "";
  const hwGoal = selectedProduct
    ? [
        `Igényelt eszköz: ${selectedProduct.name} (${selectedProduct.vendor}), ${qty} db.`,
        `Termékkör: ${selectedCategory?.name ?? "—"}.`,
        `Konfiguráció: ${selectedProduct.spec.cpu} · ${selectedProduct.spec.ram} · ${selectedProduct.spec.storage} · ${selectedProduct.spec.os} ${selectedProduct.spec.osVersion}.`,
        form.goal.trim() ? `Indoklás: ${form.goal.trim()}` : "",
        form.device.trim() ? `Használat helye: ${form.device.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : form.goal;

  const submit = (draft: boolean) => {
    const id = createRequest({
      title: isHw ? hwTitle : form.title,
      domain: form.domain as DomainKey,
      goal: isHw ? hwGoal : form.goal,
      catalogItemId: form.catalogItemId || undefined,
      productCategoryId: form.productCategoryId || undefined,
      productId: form.productId || undefined,
      quantity: isHw ? qty : undefined,
      estimatedCost: isHw && selectedProduct ? selectedProduct.referencePrice * qty : undefined,
      status: draft ? "piszkozat" : "bekuldve",
      users: form.users,
      userCount: form.userCount,
      personalData: form.personalData === "igen",
      integration: form.integration || "Nem szükséges",
      recurring: form.recurring === "egyszeri" ? "Egyszeri igény" : "Tartós szolgáltatás",
      budget: form.budget || "Nincs megadva",
      dueDate: form.deadline || undefined,
      priority: "kozepes",
      ai: {
        category: domain?.name ?? "",
        subtype: preset?.name ?? "Automatikus besorolás",
        team: lookup.team(
          CATALOG.find((c) => c.id === form.catalogItemId)?.teamId ??
            (form.domain === "web" ? "t-web" : form.domain === "hardver" ? "t-hw" : form.domain === "digitalizacio" ? "t-dig" : "t-it"),
        ),
        complexity: form.domain === "digitalizacio" ? "összetett" : "közepes",
        workflow: "Igénylő → szervezeti jóváhagyó → szolgáltatási csapat",
        approvalNeeded: true,
        projectCandidate: form.domain === "digitalizacio",
        confidence: 0.81,
      },
    });
    toast.success(draft ? "Piszkozat mentve" : "Igény beküldve", {
      description: `Azonosító: ${id}`,
    });
    navigate({ to: "/igeny/$id", params: { id } });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Vissza a kezdőlapra
      </Link>

      <ol className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        {stepLabels.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full border text-xs font-semibold",
                i < step
                  ? "border-success bg-success text-success-foreground"
                  : i === step
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
            </span>
            <span className={cn(i === step ? "font-semibold" : "text-muted-foreground")}>{s}</span>
            {i < stepLabels.length - 1 && <span className="text-border" aria-hidden="true">—</span>}
          </li>
        ))}
      </ol>

      {key === "domain" && (
        <section>
          <h1 className="font-display text-2xl font-semibold">Miben segíthetünk?</h1>
          <p className="mt-2 text-muted-foreground">Válassza ki, melyik területhez kapcsolódik az igény.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {DOMAINS.map((d) => {
              const Icon = ICONS[d.key];
              const selected = form.domain === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => set({ domain: d.key })}
                  aria-pressed={selected}
                  className={cn(
                    "card-surface flex gap-4 p-5 text-left transition-colors",
                    selected ? "border-primary ring-2 ring-primary/25" : "hover:bg-secondary/60",
                  )}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-display font-semibold">{d.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{d.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {key === "category" && (
        <section>
          <h1 className="font-display text-2xl font-semibold">Milyen eszközre van szüksége?</h1>
          <p className="mt-2 text-muted-foreground">
            Válassza ki az eszköz típusát – a következő lépésben a konkrét modellek közül
            választhat.
          </p>
          {cats.length === 0 ? (
            <p className="card-surface mt-6 p-6 text-sm text-muted-foreground">
              Jelenleg nincs igényelhető eszköztípus. Kérjük, vegye fel a kapcsolatot a beszerzéssel.
            </p>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {cats.map((c) => {
                const selected = form.productCategoryId === c.id;
                const count = visibleProducts(products, tier).filter(
                  (p) => p.categoryId === c.id,
                ).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => set({ productCategoryId: c.id, productId: "" })}
                    className={cn(
                      "card-surface p-5 text-left transition-colors",
                      selected ? "border-primary ring-2 ring-primary/25" : "hover:bg-secondary/60",
                    )}
                  >
                    <span className="block font-display font-semibold">{c.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{c.description}</span>
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {count} választható modell
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {key === "product" && (
        <section>
          <h1 className="font-display text-2xl font-semibold">
            {selectedCategory?.name ?? "Eszköz"} – válasszon modellt
          </h1>
          <p className="mt-2 text-muted-foreground">
            A kiválasztott modell technikai adatlapja azonnal megjelenik.
          </p>
          {catProducts.length === 0 ? (
            <p className="card-surface mt-6 p-6 text-sm text-muted-foreground">
              Ehhez a termékkörhöz jelenleg nincs elérhető modell.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {catProducts.map((p) => {
                const selected = form.productId === p.id;
                return (
                  <div key={p.id} className="space-y-0">
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => set({ productId: p.id })}
                      className={cn(
                        "card-surface w-full p-5 text-left transition-colors",
                        selected ? "border-primary ring-2 ring-primary/25" : "hover:bg-secondary/60",
                      )}
                    >
                      <span className="block font-display font-semibold">{p.name}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {p.vendor} · {p.spec.cpu} · {p.spec.ram} · {p.spec.storage}
                      </span>
                    </button>
                    {selected && (
                      <div className="card-surface mt-2 p-5">
                        <h2 className="font-display text-base font-semibold">Technikai adatlap</h2>
                        <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                          {(
                            [
                              ["Operációs rendszer", `${p.spec.os} ${p.spec.osVersion}`],
                              ["Processzor", p.spec.cpu],
                              ["Memória", p.spec.ram],
                              ["Tároló", p.spec.storage],
                              ["Kijelző", p.spec.display],
                              ["Akkumulátor", p.spec.battery],
                              ["Csatlakozók", p.spec.ports],
                              ["Garancia", p.spec.warranty],
                            ] as [string, string | undefined][]
                          )
                            .filter(([, v]) => !!v)
                            .map(([k, v]) => (
                              <div key={k} className="text-sm">
                                <dt className="text-muted-foreground">{k}</dt>
                                <dd>{v}</dd>
                              </div>
                            ))}
                        </dl>
                        {p.spec.features.length > 0 && (
                          <ul className="mt-4 flex flex-wrap gap-2">
                            {p.spec.features.map((f) => (
                              <li
                                key={f}
                                className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                              >
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}
                        {p.note && <p className="mt-3 text-sm text-muted-foreground">{p.note}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {key === "goal" && (
        <section className="space-y-5">
          <div>
            <h1 className="font-display text-2xl font-semibold">Mit szeretne elérni?</h1>
            <p className="mt-2 text-muted-foreground">
              Írja le röviden, mit szeretne elérni. Nem szükséges technikai megoldást megadnia.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Az igény rövid megnevezése</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="Pl. Továbbképzési jelentkezés online felületen"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">Leírás</Label>
            <Textarea
              id="goal"
              rows={6}
              value={form.goal}
              onChange={(e) => set({ goal: e.target.value, refined: false })}
              placeholder="Szeretnénk, ha a tanszéki továbbképzésekre a jelentkezés nem e-mailben történne, hanem egy online felületen, és automatikusan készülne résztvevői lista."
            />
            <p className="text-xs text-muted-foreground">
              Legalább néhány mondat segít a pontos besorolásban.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={form.goal.trim().length < 20}
              onClick={() => {
                set({ goal: refine(form.goal), refined: true });
                toast.info("Az AI javaslatot készített – kérjük, ellenőrizze és szükség esetén módosítsa.");
              }}
            >
              <Sparkles className="size-4" /> Segíts pontosítani az igényt
            </Button>
          </div>
          {form.refined && (
            <AiBadge>
              <p className="text-sm">
                A leírást strukturáltabb formára hoztuk. A beküldés előtt Ön hagyja jóvá – bármelyik
                részt szabadon átírhatja a fenti mezőben.
              </p>
            </AiBadge>
          )}
        </section>
      )}

      {key === "details" && (
        <section className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-semibold">Néhány pontosító kérdés</h1>
            <p className="mt-2 text-muted-foreground">
              Csak azt kérdezzük, ami ehhez a típusú igényhez szükséges.
            </p>
          </div>

          {isHw && (
            <>
              <div className="space-y-2">
                <Label htmlFor="qty">Hány darabra van szükség?</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => set({ quantity: e.target.value })}
                  className="max-w-[160px]"
                />
              </div>
              {!isPersonalUse && (
                <div className="space-y-2">
                  <Label htmlFor="hw-goal">Mire használná az eszközt?</Label>
                  <Textarea
                    id="hw-goal"
                    rows={4}
                    value={form.goal}
                    onChange={(e) => set({ goal: e.target.value })}
                    placeholder="Pl. oktatói munka, terepi adatgyűjtés, laborvezérlés"
                  />
                </div>
              )}
            </>
          )}

          {questions.includes("users") && !isPersonalUse && (
            <div className="space-y-2">
              <Label htmlFor="users">Kik fogják használni?</Label>
              <Input
                id="users"
                value={form.users}
                onChange={(e) => set({ users: e.target.value })}
                placeholder="Pl. intézeti oktatók és a képzésre jelentkezők"
              />
            </div>
          )}
          {questions.includes("count") && (
            <div className="space-y-2">
              <Label htmlFor="count">Körülbelül hány felhasználót érint?</Label>
              <Input
                id="count"
                value={form.userCount}
                onChange={(e) => set({ userCount: e.target.value })}
                placeholder="Pl. 50–200 fő"
              />
            </div>
          )}
          {questions.includes("site") && (
            <div className="space-y-2">
              <Label htmlFor="site">Melyik oldalt érinti?</Label>
              <Input
                id="site"
                value={form.siteUrl}
                onChange={(e) => set({ siteUrl: e.target.value })}
                placeholder="Pl. aok.pte.hu/elettani"
              />
            </div>
          )}
          {questions.includes("existing") && (
            <div className="space-y-2">
              <Label htmlFor="existing">Van már meglévő rendszer vagy folyamat?</Label>
              <Textarea
                id="existing"
                rows={3}
                value={form.existing}
                onChange={(e) => set({ existing: e.target.value })}
                placeholder="Pl. jelenleg e-mailben és Excel-táblában gyűjtjük az adatokat"
              />
            </div>
          )}
          {questions.includes("integration") && (
            <div className="space-y-2">
              <Label htmlFor="integration">Szükséges más rendszerrel integrálni?</Label>
              <Input
                id="integration"
                value={form.integration}
                onChange={(e) => set({ integration: e.target.value })}
                placeholder="Pl. Neptun, Microsoft 365"
              />
            </div>
          )}
          {questions.includes("data") && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">
                Kezel-e személyes vagy érzékeny adatot?
              </legend>
              <RadioGroup
                value={form.personalData}
                onValueChange={(v) => set({ personalData: v })}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="igen" id="pd-igen" />
                  <Label htmlFor="pd-igen" className="font-normal">Igen</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="nem" id="pd-nem" />
                  <Label htmlFor="pd-nem" className="font-normal">Nem</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="bizonytalan" id="pd-b" />
                  <Label htmlFor="pd-b" className="font-normal">Nem tudom</Label>
                </div>
              </RadioGroup>
            </fieldset>
          )}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              Egyszeri igényről vagy tartós szolgáltatásról van szó?
            </legend>
            <RadioGroup
              value={form.recurring}
              onValueChange={(v) => set({ recurring: v })}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="egyszeri" id="r-e" />
                <Label htmlFor="r-e" className="font-normal">Egyszeri</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="tartos" id="r-t" />
                <Label htmlFor="r-t" className="font-normal">Tartós</Label>
              </div>
            </RadioGroup>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deadline">Tervezett határidő</Label>
              <Input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => set({ deadline: e.target.value })}
              />
            </div>
          </div>
        </section>
      )}

      {key === "summary" && (
        <section className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-semibold">Igény összegzése</h1>
            <p className="mt-2 text-muted-foreground">
              Ellenőrizze az adatokat. Bármelyik lépéshez visszaléphet módosításért.
            </p>
          </div>
          <dl className="card-surface divide-y divide-border">
            {[
              ...(isHw && selectedProduct
                ? ([
                    ["Termékkör", selectedCategory?.name ?? "—"],
                    ["Kiválasztott eszköz", `${selectedProduct.name} (${selectedProduct.vendor})`],
                    ["Darabszám", `${qty} db`],
                    [
                      "Konfiguráció",
                      `${selectedProduct.spec.cpu} · ${selectedProduct.spec.ram} · ${selectedProduct.spec.storage} · ${selectedProduct.spec.os} ${selectedProduct.spec.osVersion}`,
                    ],
                    [
                      "Becsült érték",
                      `${(selectedProduct.referencePrice * qty).toLocaleString("hu-HU")} Ft`,
                    ],
                  ] as [string, string][])
                : []),
              ["Cél", isHw ? form.goal || "Nincs megadva" : form.goal],
              ["Érintett szervezeti egység", lookup.unit(currentUser.orgUnitId)],
              ["Felhasználók", [form.users, form.userCount].filter(Boolean).join(" · ") || "Nincs megadva"],
              ["Kívánt eredmény", isHw ? hwTitle : form.title],
              ["Határidő", form.deadline || "Nincs megadva"],
              ["Adatkezelési érintettség", form.personalData === "igen" ? "Igen – adatvédelmi vizsgálat szükséges" : form.personalData === "bizonytalan" ? "Bizonytalan – a szolgáltatási csapat megvizsgálja" : "Nem"],
              ["Integráció", form.integration || "Nem szükséges"],
              ["Költségkeret", form.budget || "Nincs megadva"],
              ["Becsült prioritás", form.deadline ? "Magas" : "Közepes"],
            ].map(([k, v]) => (
              <div key={k as string} className="grid gap-1 px-5 py-3 sm:grid-cols-[220px_1fr]">
                <dt className="text-sm text-muted-foreground">{k}</dt>
                <dd className="text-sm">{v as string}</dd>
              </div>
            ))}
          </dl>
          <AiBadge>
            <p className="text-sm">
              A rendszer előzetesen a(z) <strong>{domain?.name}</strong> szolgáltatási területhez
              sorolta be az igényt. A végleges besorolást és a felelős csapatot a szolgáltatási
              munkatárs erősíti meg.
            </p>
          </AiBadge>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => submit(false)} disabled={isHw ? !selectedProduct : !form.title || !form.goal}>
              Igény beküldése
            </Button>
            <Button size="lg" variant="outline" onClick={() => submit(true)} disabled={isHw ? !selectedProduct : !form.title}>
              Mentés piszkozatként
            </Button>
          </div>
        </section>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
        {step === 0 ? (
          <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="size-4" /> Mégse
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
            <ArrowLeft className="size-4" /> Vissza
          </Button>
        )}
        {step < lastStep && (
          <Button onClick={() => setStep((s) => Math.min(lastStep, s + 1))} disabled={!canNext}>
            Tovább <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function contextQuestions(domain: DomainKey | "") {
  switch (domain) {
    case "szoftver":
      return ["users", "count", "existing", "integration", "data"];
    case "hardver":
      return ["users"];
    case "web":
      return ["site", "users", "data"];
    case "digitalizacio":
      return ["users", "count", "existing", "integration", "data"];
    default:
      return [];
  }
}

function refine(goal: string) {
  return [
    "Cél: " + goal.trim(),
    "",
    "Jelenlegi helyzet: a folyamat ma manuálisan, e-mailben és táblázatban zajlik.",
    "Kívánt eredmény: strukturált, online felület, automatikus adatgyűjtéssel és visszaigazolással.",
    "Érintettek: az igénylő szervezeti egység munkatársai és a folyamat résztvevői.",
  ].join("\n");
}