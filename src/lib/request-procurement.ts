import { HARDWARE_STANDARDS, NEXT_FINANCIAL_YEAR, REFERENCE_PRICES } from "./asset-data";
import type { ProcurementPlanItem, Quarter } from "./asset-types";
import type { ServiceRequest } from "./types";

/**
 * Jóváhagyott igényből beszerzési tervsor-javaslat.
 * A leképezés kulcsszavak alapján választ hardverstandardot és referenciaárat.
 */

interface Rule {
  words: string[];
  standardKey: string;
}

const RULES: Rule[] = [
  { words: ["workstation", "munkaállomás", "gpu", "szimuláció", "hpc"], standardKey: "std-research-workstation" },
  { words: ["notebook", "laptop", "hordozható"], standardKey: "std-office-notebook" },
  { words: ["macbook", "videovágás", "rendering", "emelt teljesítmény"], standardKey: "std-power-notebook" },
  { words: ["monitor", "kijelző"], standardKey: "std-monitor-base" },
  { words: ["tablet", "ipad"], standardKey: "std-tablet" },
  { words: ["dokkoló", "dokkolo", "dock"], standardKey: "std-dock" },
  { words: ["asztali", "pc", "desktop", "számítógép", "szamitogep"], standardKey: "std-office-desktop" },
];

function fallbackStandardKey(): string {
  return HARDWARE_STANDARDS[0]?.key ?? "std-office-notebook";
}

function pickStandardKey(text: string): string | null {
  for (const rule of RULES) {
    if (rule.words.some((w) => text.includes(w))) {
      const found = HARDWARE_STANDARDS.find((s) => s.key === rule.standardKey);
      if (found) return found.key;
    }
  }
  return null;
}

function pickQuantity(text: string): number {
  const m = text.match(/(\d{1,3})\s*(db|darab)/);
  const n = m ? Number(m[1]) : 1;
  return Number.isFinite(n) && n > 0 && n < 500 ? n : 1;
}

function quarterFor(priority: ServiceRequest["priority"]): Quarter {
  if (priority === "kritikus" || priority === "magas") return "Q1";
  if (priority === "normal") return "Q2";
  return "Q3";
}

/** Beszerzést igénylő-e a jóváhagyott igény. */
export function needsProcurement(r: ServiceRequest): boolean {
  if (r.internal?.procurement) return true;
  if (r.domain !== "hardver" && r.domain !== "szoftver") return false;
  const text = `${r.title} ${r.goal}`.toLowerCase();
  return ["beszerz", "vásár", "vasar", "csere", "új eszköz", "uj eszkoz", "licenc", "notebook", "laptop", "monitor", "workstation", "számítógép"].some(
    (w) => text.includes(w),
  );
}

export function planItemFromRequest(r: ServiceRequest): Omit<ProcurementPlanItem, "id"> {
  const text = `${r.title} ${r.goal}`.toLowerCase();
  const standardKey = pickStandardKey(text) ?? fallbackStandardKey();
  const standard = HARDWARE_STANDARDS.find((s) => s.key === standardKey)!;
  const price =
    REFERENCE_PRICES.find((p) => p.id === standard.referencePriceId) ??
    REFERENCE_PRICES.find((p) => p.categoryKey === standard.categoryKey) ??
    REFERENCE_PRICES[0]!;
  const quantity = pickQuantity(text);

  return {
    planYear: NEXT_FINANCIAL_YEAR,
    quarter: quarterFor(r.priority),
    orgUnitId: r.orgUnitId,
    replacedAssetIds: [],
    reason: `Jóváhagyott igény (${r.id}): ${r.title}`,
    categoryKey: standard.categoryKey,
    standardKey: standard.key,
    quantity,
    referencePriceId: price.id,
    unitPriceOverride: r.estimatedCost && quantity > 0 ? Math.round(r.estimatedCost / quantity) : undefined,
    priceChangePct: 0,
    contingencyPct: 10,
    quantityDiscountPct: 0,
    inflationPct: 3,
    priority: r.priority === "kritikus" ? "kritikus" : r.priority === "magas" ? "magas" : "kozepes",
    fundingSourceId: "fs-kari",
    status: "jovahagyasra_var",
    comment: "Automatikusan generálva jóváhagyott szolgáltatási igényből; gazdasági felülvizsgálat szükséges.",
    kind: "uj_kapacitas",
    sourceRequestId: r.id,
  };
}
