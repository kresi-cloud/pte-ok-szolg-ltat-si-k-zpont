import { NEXT_FINANCIAL_YEAR } from "./asset-data";
import {
  PLAN_APPROVAL_LEAD_DAYS,
  type PlanApproval,
  type Quarter,
} from "./asset-types";

const QUARTER_START_MONTH: Record<Quarter, number> = { Q1: 0, Q2: 3, Q3: 6, Q4: 9 };

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function minusDays(dateIso: string, days: number): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return iso(d);
}

/** Az éves és a négy negyedéves jóváhagyási ciklus a tervezési évre. */
export function buildPlanApprovals(year = NEXT_FINANCIAL_YEAR): PlanApproval[] {
  const yearStart = `${year}-01-01`;
  const annual: PlanApproval = {
    id: `pa-${year}-eves`,
    scope: "eves",
    planYear: year,
    periodStart: yearStart,
    dueAt: minusDays(yearStart, PLAN_APPROVAL_LEAD_DAYS.eves),
    status: "jovahagyasra_var",
  };
  const quarters = (Object.keys(QUARTER_START_MONTH) as Quarter[]).map((q) => {
    const start = iso(new Date(Date.UTC(year, QUARTER_START_MONTH[q], 1)));
    return {
      id: `pa-${year}-${q}`,
      scope: "negyedeves",
      planYear: year,
      quarter: q,
      periodStart: start,
      dueAt: minusDays(start, PLAN_APPROVAL_LEAD_DAYS.negyedeves),
      status: "jovahagyasra_var",
    } satisfies PlanApproval;
  });
  return [annual, ...quarters];
}

/** Hátralévő napok a jóváhagyási határidőig (negatív, ha lejárt). */
export function daysUntil(dateIso: string, from = new Date()): number {
  const target = new Date(`${dateIso}T00:00:00Z`).getTime();
  const base = new Date(iso(from) + "T00:00:00Z").getTime();
  return Math.round((target - base) / 86_400_000);
}