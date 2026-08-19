import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore, lookup } from "@/lib/store";
import { NEXT_FINANCIAL_YEAR, HARDWARE_STANDARDS } from "@/lib/asset-data";
import { huf, itemCost } from "@/lib/asset-logic";
import {
  PLAN_APPROVAL_LEAD_DAYS,
  PLAN_APPROVAL_STATUS_LABELS,
  PLAN_SCOPE_LABELS,
  PROCUREMENT_STATUS_LABELS,
  QUARTER_LABELS,
  type PlanApproval,
  type ProcurementPlanItem,
  type Quarter,
} from "@/lib/asset-types";
import { daysUntil } from "@/lib/plan-approvals";
import { StatTile } from "@/components/asset-bits";

export const Route = createFileRoute("/beszerzesek")({
  head: () => ({
    meta: [
      { title: "Beszerzői munkatér – ÁOK Digitális Szolgáltatási Portál" },
      {
        name: "description",
        content:
          "Jóváhagyott eseti beszerzések átvétele, valamint a negyedéves és éves beszerzési tervek dékáni jóváhagyási státusza és határidői.",
      },
      { property: "og:title", content: "Beszerzői munkatér – ÁOK Digitális Szolgáltatási Portál" },
      {
        property: "og:description",
        content: "Eseti beszerzések és tervciklusok egy felületen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuyerWorkspace,
});

const QUARTERS: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];

function standardLabel(key: string) {
  return HARDWARE_STANDARDS.find((s) => s.key === key)?.label ?? key;
}

function ItemRow({ item, canAct }: { item: ProcurementPlanItem; canAct: boolean }) {
  const store = useStore();
  const cost = itemCost(item);
  return (
    <tr className="border-t border-border align-top">
      <td className="px-3 py-3">
        <span className="block text-sm font-medium">{standardLabel(item.standardKey)}</span>
        <span className="block text-xs text-muted-foreground">
          {item.quantity} db · {lookup.unit(item.orgUnitId)} · {QUARTER_LABELS[item.quarter]}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">{item.reason}</span>
        {item.sourceRequestId && (
          <Link
            to="/igeny/$id"
            params={{ id: item.sourceRequestId }}
            className="mt-1 inline-block text-xs font-medium text-primary underline"
          >
            Forrásigény: {item.sourceRequestId}
          </Link>
        )}
      </td>
      <td className="px-3 py-3 text-sm whitespace-nowrap">{huf(cost.withContingency)}</td>
      <td className="px-3 py-3 text-xs">{PROCUREMENT_STATUS_LABELS[item.status]}</td>
      <td className="px-3 py-3">
        {canAct && (
          <div className="flex flex-wrap gap-2">
            {item.status !== "beszerzes_alatt" && item.status !== "teljesult" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  store.updatePlanItem(item.id, { status: "beszerzes_alatt" });
                  toast.success("Beszerzés elindítva");
                }}
              >
                Beszerzés indítása
              </Button>
            )}
            {item.status !== "teljesult" && (
              <Button
                size="sm"
                onClick={() => {
                  store.updatePlanItem(item.id, { status: "teljesult" });
                  toast.success("Teljesítés rögzítve");
                }}
              >
                Teljesítve
              </Button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

function ItemsTable({ items, canAct }: { items: ProcurementPlanItem[]; canAct: boolean }) {
  if (items.length === 0)
    return <p className="px-3 py-6 text-sm text-muted-foreground">Nincs megjeleníthető tétel.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="text-xs tracking-wide text-muted-foreground uppercase">
            <th className="px-3 py-2">Tétel</th>
            <th className="px-3 py-2">Becsült bruttó</th>
            <th className="px-3 py-2">Állapot</th>
            <th className="px-3 py-2">Művelet</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <ItemRow key={i.id} item={i} canAct={canAct} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApprovalCard({ approval }: { approval: PlanApproval }) {
  const store = useStore();
  const [comment, setComment] = useState("");
  const isDean = store.activeRole === "dekan";
  const left = daysUntil(approval.dueAt);
  const items = store.planItems.filter(
    (p) =>
      p.planYear === approval.planYear &&
      (approval.scope === "eves" || p.quarter === approval.quarter),
  );
  const total = items.reduce((s, i) => s + itemCost(i).withContingency, 0);

  return (
    <article className="card-surface space-y-3 p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">
            {PLAN_SCOPE_LABELS[approval.scope]} – {approval.planYear}
            {approval.quarter ? ` ${QUARTER_LABELS[approval.quarter]}` : ""}
          </h3>
          <p className="text-xs text-muted-foreground">
            Esedékesség: {approval.periodStart} · dékáni jóváhagyási határidő:{" "}
            <strong>{approval.dueAt}</strong> ({PLAN_APPROVAL_LEAD_DAYS[approval.scope]} nappal az
            esedékesség előtt)
          </p>
        </div>
        <span
          className={
            approval.status === "jovahagyva"
              ? "rounded-sm bg-accent/15 px-2 py-1 text-xs font-semibold text-accent-foreground"
              : approval.status === "visszakuldve"
                ? "rounded-sm bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive"
                : "rounded-sm bg-secondary px-2 py-1 text-xs font-semibold"
          }
        >
          {PLAN_APPROVAL_STATUS_LABELS[approval.status]}
        </span>
      </header>

      <p className="text-sm">
        {items.length} tétel · becsült keret: <strong>{huf(total)}</strong>
      </p>
      {approval.status === "jovahagyasra_var" && (
        <p className="text-xs text-muted-foreground">
          {left >= 0
            ? `${left} nap van hátra a jóváhagyási határidőig.`
            : `A jóváhagyási határidő ${Math.abs(left)} napja lejárt.`}
        </p>
      )}
      {approval.decidedAt && (
        <p className="text-xs text-muted-foreground">
          Döntés: {approval.decidedAt} · {lookup.user(approval.decidedBy)?.name ?? "dékán"}
          {approval.comment ? ` – ${approval.comment}` : ""}
        </p>
      )}

      {isDean && approval.status !== "jovahagyva" && (
        <div className="space-y-2 border-t border-border pt-3">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Dékáni megjegyzés (opcionális)"
            rows={2}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                store.decidePlanApproval(approval.id, "jovahagyva", comment || undefined);
                toast.success("Terv jóváhagyva");
              }}
            >
              Jóváhagyom
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                store.decidePlanApproval(approval.id, "visszakuldve", comment || undefined);
                toast("Terv visszaküldve átdolgozásra");
              }}
            >
              Átdolgozásra visszaküldöm
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}

function BuyerWorkspace() {
  const store = useStore();
  const allowed = ["beszerzo", "dekan", "admin", "szolgaltatasgazda", "superuser"].includes(
    store.activeRole,
  );

  const yearItems = useMemo(
    () => store.planItems.filter((p) => p.planYear === NEXT_FINANCIAL_YEAR),
    [store.planItems],
  );
  const adHoc = yearItems.filter((p) => p.sourceRequestId);
  const approvals = store.planApprovals ?? [];
  const annual = approvals.filter((a) => a.scope === "eves");
  const quarterly = approvals.filter((a) => a.scope === "negyedeves");

  if (!allowed) {
    return (
      <div className="card-surface mx-auto max-w-2xl space-y-3 p-6">
        <h1 className="font-display text-xl font-semibold">Beszerzői munkatér</h1>
        <p className="text-sm text-muted-foreground">
          Ez a felület a beszerzési referens, a dékán és a szolgáltatásgazda számára érhető el.
        </p>
        <Button asChild variant="outline">
          <Link to="/igenyeim">Saját igényeim</Link>
        </Button>
      </div>
    );
  }

  const openAdHoc = adHoc.filter((p) => p.status !== "teljesult").length;
  const pendingApprovals = approvals.filter((a) => a.status === "jovahagyasra_var").length;
  const totalYear = yearItems.reduce((s, i) => s + itemCost(i).withContingency, 0);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-semibold">Beszerzői munkatér</h1>
        <p className="text-sm text-muted-foreground">
          Jóváhagyott eseti beszerzések, valamint a {NEXT_FINANCIAL_YEAR}. évi negyedéves és éves
          beszerzési terv jóváhagyási státusza.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Nyitott eseti beszerzés" value={String(openAdHoc)} />
        <StatTile label="Dékáni jóváhagyásra vár" value={String(pendingApprovals)} />
        <StatTile label={`${NEXT_FINANCIAL_YEAR}. évi keret`} value={huf(totalYear)} />
      </div>

      <Tabs defaultValue="eseti">
        <TabsList>
          <TabsTrigger value="eseti">Eseti beszerzések</TabsTrigger>
          <TabsTrigger value="negyedeves">Negyedéves terv</TabsTrigger>
          <TabsTrigger value="eves">Éves terv</TabsTrigger>
        </TabsList>

        <TabsContent value="eseti" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Jóváhagyott szolgáltatási igényből keletkezett tételek – ezeket a beszerző intézi.
          </p>
          <div className="card-surface">
            <ItemsTable items={adHoc} canAct={store.activeRole === "beszerzo"} />
          </div>
        </TabsContent>

        <TabsContent value="negyedeves" className="mt-4 space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {quarterly.map((a) => (
              <ApprovalCard key={a.id} approval={a} />
            ))}
          </div>
          {QUARTERS.map((q) => (
            <section key={q} className="card-surface">
              <h3 className="border-b border-border px-3 py-2 text-sm font-semibold">
                {QUARTER_LABELS[q]} tételei
              </h3>
              <ItemsTable
                items={yearItems.filter((i) => i.quarter === q)}
                canAct={store.activeRole === "beszerzo"}
              />
            </section>
          ))}
        </TabsContent>

        <TabsContent value="eves" className="mt-4 space-y-6">
          {annual.map((a) => (
            <ApprovalCard key={a.id} approval={a} />
          ))}
          <div className="card-surface">
            <ItemsTable items={yearItems} canAct={store.activeRole === "beszerzo"} />
          </div>
          <p className="text-xs text-muted-foreground">
            Részletes tervezés és szerkesztés:{" "}
            <Link to="/beszerzesi-terv" className="font-medium text-primary underline">
              Beszerzési terv
            </Link>
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}