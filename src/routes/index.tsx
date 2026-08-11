import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  CircleAlert,
  Globe,
  Laptop,
  Plus,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { DOMAINS, lookup, useStore } from "@/lib/store";
import type { DomainKey } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kezdőlap – ÁOK Digitális Szolgáltatási Portál" },
      {
        name: "description",
        content:
          "Indítson digitális vagy informatikai igényt, kövesse a folyamatban lévő ügyeit és intézze a teendőit egy helyen.",
      },
      { property: "og:title", content: "Kezdőlap – ÁOK Digitális Szolgáltatási Portál" },
      {
        property: "og:description",
        content: "Digitális és informatikai igények egy helyen a PTE ÁOK munkatársai számára.",
      },
    ],
  }),
  component: Home,
});

const DOMAIN_ICONS: Record<DomainKey, typeof Boxes> = {
  szoftver: Boxes,
  hardver: Laptop,
  web: Globe,
  digitalizacio: Workflow,
};

function Home() {
  const { currentUser, requests } = useStore();
  const firstName = currentUser.name.split(" ").slice(-1)[0];

  const mine = requests.filter((r) => r.requesterId === currentUser.id);
  const active = mine.filter((r) => !["lezarva", "elutasitva"].includes(r.status));
  const todos = mine.filter((r) => r.status === "pontositas");
  const approvals = requests.filter(
    (r) =>
      r.status === "jovahagyasra_var" &&
      r.approvals.some((a) => a.approverId === currentUser.id && a.decision === "fuggoben"),
  );

  return (
    <div className="space-y-10">
      <section className="pte-band -mx-4 -mt-8 px-4 py-12 lg:-mx-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.18em] uppercase opacity-75">
              PTE ÁOK · Digitális Szolgáltatási Portál
            </p>
            <h1 className="mt-3 text-4xl font-semibold lg:text-5xl">Jó napot, {firstName}!</h1>
            <p className="mt-3 text-base opacity-85">
              Miben segíthetünk? Indítson igényt, kövesse ügyeit és intézze teendőit egy helyen.
            </p>
          </div>
          <Link
            to="/uj-igeny"
            className="pte-cta inline-flex items-center gap-2 rounded-sm px-6 py-3.5 text-sm transition-colors"
          >
            <Plus className="size-4" /> Új igény indítása <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {(todos.length > 0 || approvals.length > 0) && (
        <section aria-labelledby="teendoim">
          <h2 id="teendoim" className="mb-3 font-display text-lg font-semibold">
            Teendőim
          </h2>
          <ul className="space-y-2">
            {todos.map((r) => (
              <li key={r.id}>
                <Link
                  to="/igeny/$id"
                  params={{ id: r.id }}
                  className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 transition-colors hover:bg-warning/15"
                >
                  <CircleAlert className="size-5 shrink-0 text-warning-foreground" aria-hidden="true" />
                  <span className="text-sm">
                    <span className="font-medium">{r.id}</span> – további információ szükséges az
                    ügyintéző részéről.
                  </span>
                  <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
            {approvals.map((r) => (
              <li key={r.id}>
                <Link
                  to="/igeny/$id"
                  params={{ id: r.id }}
                  className="flex items-center gap-3 rounded-lg border border-info/30 bg-info/5 px-4 py-3 transition-colors hover:bg-info/10"
                >
                  <CircleAlert className="size-5 shrink-0 text-info" aria-hidden="true" />
                  <span className="text-sm">
                    <span className="font-medium">{r.id}</span> – jóváhagyásra vár Öntől: {r.title}
                  </span>
                  <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="szolgaltatasok">
        <h2 id="szolgaltatasok" className="mb-1 font-display text-lg font-semibold">
          Mit szeretne elérni?
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Válassza ki a területet – nem szükséges tudnia, melyik egység illetékes, a rendszer belül
          irányítja az igényt.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {DOMAINS.map((d) => {
            const Icon = DOMAIN_ICONS[d.key];
            return (
              <Link
                key={d.key}
                to="/uj-igeny"
                search={{ domain: d.key }}
                className="group card-surface flex flex-col p-5 transition-colors hover:border-primary/40 hover:bg-secondary/60"
              >
                <span className="grid size-10 place-items-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">{d.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{d.description}</p>
                <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                  {d.examples.slice(0, 4).map((e) => (
                    <li key={e}>• {e}</li>
                  ))}
                </ul>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Igény indítása <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="folyamatban">
        <div className="mb-3 flex items-end justify-between">
          <h2 id="folyamatban" className="font-display text-lg font-semibold">
            Folyamatban lévő igényeim
          </h2>
          <Link to="/igenyeim" className="text-sm font-medium text-primary hover:underline">
            Összes igényem
          </Link>
        </div>
        {active.length === 0 ? (
          <p className="card-surface p-6 text-sm text-muted-foreground">
            Jelenleg nincs folyamatban lévő igénye.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {active.map((r) => (
              <Link
                key={r.id}
                to="/igeny/$id"
                params={{ id: r.id }}
                className="card-surface flex flex-col gap-3 p-5 transition-colors hover:border-primary/40"
              >
                <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                <span className="font-display font-semibold">{r.title}</span>
                <StatusBadge status={r.status} className="self-start" />
                <dl className="mt-1 space-y-1 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <dt>Felelős:</dt>
                    <dd className="text-foreground">{lookup.team(r.teamId)}</dd>
                  </div>
                  {r.dueDate && (
                    <div className="flex gap-2">
                      <dt>Tervezett befejezés:</dt>
                      <dd className="text-foreground">{r.dueDate}</dd>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <dt>Utolsó frissítés:</dt>
                    <dd className="text-foreground">{r.updatedAt}</dd>
                  </div>
                </dl>
                <p className="mt-auto border-t border-border pt-3 text-sm">
                  <span className="text-muted-foreground">Következő lépés: </span>
                  {r.nextStep}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}