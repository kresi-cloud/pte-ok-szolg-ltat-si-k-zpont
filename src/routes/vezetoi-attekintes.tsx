import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DOMAINS, ORG_UNITS, PROJECTS, lookup, useStore } from "@/lib/store";
import { STATUS_LABELS, type StatusKey } from "@/lib/types";

export const Route = createFileRoute("/vezetoi-attekintes")({
  head: () => ({
    meta: [
      { title: "Vezetői áttekintés – ÁOK Digitális Szolgáltatási Portál" },
      {
        name: "description",
        content:
          "Kari szintű mutatók: igényvolumen, átfutási idők, SLA-teljesítés, költségek és portfólió.",
      },
      { property: "og:title", content: "Vezetői áttekintés – ÁOK Digitális Szolgáltatási Portál" },
      { property: "og:description", content: "Kari digitalizációs mutatók egy nézetben." },
    ],
  }),
  component: Exec,
});

const OPEN: StatusKey[] = [
  "bekuldve",
  "elso_ertekeles",
  "pontositas",
  "jovahagyasra_var",
  "elfogadva",
  "tervezes",
  "megvalositas",
  "teszteles",
  "atadasra_var",
];

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

function Exec() {
  const { requests } = useStore();

  const byDomain = useMemo(
    () =>
      DOMAINS.map((d) => ({
        name: d.short,
        nyitott: requests.filter((r) => r.domain === d.key && OPEN.includes(r.status)).length,
        lezart: requests.filter((r) => r.domain === d.key && r.status === "lezarva").length,
      })),
    [requests],
  );

  const byUnit = useMemo(
    () =>
      ORG_UNITS.map((o) => ({
        name: o.name.length > 22 ? `${o.name.slice(0, 20)}…` : o.name,
        igeny: requests.filter((r) => r.orgUnitId === o.id).length,
      }))
        .filter((x) => x.igeny > 0)
        .sort((a, b) => b.igeny - a.igeny),
    [requests],
  );

  const statusSplit = useMemo(() => {
    const map = new Map<StatusKey, number>();
    requests.forEach((r) => map.set(r.status, (map.get(r.status) ?? 0) + 1));
    return [...map.entries()].map(([k, v]) => ({ name: STATUS_LABELS[k], value: v }));
  }, [requests]);

  const closed = requests.filter((r) => r.status === "lezarva");
  const rated = closed.filter((r) => r.rating);
  const cost = requests.reduce((s, r) => s + (r.estimatedCost ?? 0), 0);

  const kpis = [
    { label: "Összes igény", value: String(requests.length) },
    { label: "Nyitott igény", value: String(requests.filter((r) => OPEN.includes(r.status)).length) },
    { label: "SLA-teljesítés", value: `${Math.round((1 - requests.filter((r) => r.slaRisk).length / Math.max(1, requests.length)) * 100)}%` },
    { label: "Átlagos átfutás", value: "11,4 nap" },
    {
      label: "Elégedettség",
      value: rated.length
        ? `${(rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length).toFixed(1)} / 5`
        : "—",
    },
    { label: "Tervezett költség", value: `${(cost / 1_000_000).toFixed(1)} MFt` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Vezetői áttekintés</h1>
        <p className="mt-1.5 text-muted-foreground">
          Kari szintű kép a digitális szolgáltatási igényekről és fejlesztésekről.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="card-surface p-5">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="font-display text-base font-semibold">Igények szolgáltatási területenként</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDomain}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="nyitott" name="Nyitott" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lezart" name="Lezárt" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-surface p-5">
          <h2 className="font-display text-base font-semibold">Állapotmegoszlás</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
                  {statusSplit.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-surface p-5 lg:col-span-2">
          <h2 className="font-display text-base font-semibold">Igények szervezeti egységenként</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byUnit} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} stroke="var(--color-muted-foreground)" />
                <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="igeny" name="Igény" fill="var(--color-chart-3)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="card-surface p-5">
        <h2 className="font-display text-base font-semibold">Fejlesztési portfólió – kiemelt tételek</h2>
        <ul className="mt-4 divide-y divide-border">
          {PROJECTS.slice(0, 5).map((p) => (
            <li key={p.id} className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_140px_120px_120px]">
              <span className="font-medium">{p.name}</span>
              <span className="text-muted-foreground">{lookup.team(p.teamId)}</span>
              <span className="text-muted-foreground">{p.strategicRelevance}</span>
              <span className="text-muted-foreground">
                {(p.estimatedCost / 1_000_000).toFixed(1)} MFt
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}