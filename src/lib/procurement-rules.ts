import type { PlanApproval, ProcurementPlanItem } from "./asset-types";
import type { AssetHandover, RoleKey } from "./types";
import { planApprovalForItem } from "./withdraw";

/**
 * A beszerzési tételek állapotátmeneteinek közös, tiszta szabályai.
 * A route-ok és a store ugyanezeket használják, hogy a gombok láthatósága
 * és a tényleges végrehajtás soha ne térhessen el egymástól.
 */

export interface ProcurementRuleContext {
  planApprovals: PlanApproval[];
  handovers: AssetHandover[];
}

export interface RuleResult {
  allowed: boolean;
  /** Miért nem végezhető el a művelet, és kinél van a következő teendő. */
  reason?: string;
}

const ok: RuleResult = { allowed: true };
const no = (reason: string): RuleResult => ({ allowed: false, reason });

/** Csak a beszerző hajthat végre beszerzési műveletet; a vezetők betekintők. */
export function isProcurementExecutor(role: RoleKey): boolean {
  return role === "beszerzo";
}

export function planApprovalApproved(approval: PlanApproval | undefined): boolean {
  return (
    !!approval && ["jovahagyva", "vegrehajtas", "lezarva"].includes(approval.status as string)
  );
}

/** A tételhez tartozó átadási rekord (ha már létrejött). */
export function handoverForItem(
  item: ProcurementPlanItem,
  handovers: AssetHandover[],
): AssetHandover | undefined {
  return (handovers ?? []).find((h) => h.planItemId === item.id);
}

/** Átadás az IT eszközmenedzsernek tervezésre. */
export function canHandToPlanner(
  item: ProcurementPlanItem,
  role: RoleKey,
): RuleResult {
  if (!isProcurementExecutor(role))
    return no("Ezt a műveletet a beszerző végzi – Ön betekintő jogosultsággal nézi az ügyet.");
  if (item.handedToPlannerAt)
    return no("A tétel már az IT eszközmenedzsernél van tervezésen.");
  return ok;
}

/** Beszerzés indítása: csak jóváhagyott tervciklus alapján. */
export function canStartProcurement(
  item: ProcurementPlanItem,
  ctx: ProcurementRuleContext,
  role: RoleKey,
): RuleResult {
  if (!isProcurementExecutor(role))
    return no("A beszerzést a beszerző indítja – Ön betekintő jogosultsággal nézi az ügyet.");
  if (item.status === "beszerzes_alatt") return no("A beszerzés már folyamatban van.");
  if (item.status === "teljesult") return no("A tétel már teljesült.");
  const approval = planApprovalForItem(item, ctx.planApprovals ?? []);
  if (!approval)
    return no("A tételhez még nem tartozik beszerzési tervciklus – az IT eszközmenedzser ütemezésére vár.");
  if (!planApprovalApproved(approval))
    return no(
      "A tervciklus még nincs jóváhagyva – a gazdasági vezetői ellenőrzés és a dékáni jóváhagyás után indítható a beszerzés.",
    );
  return ok;
}

/** Beérkezés rögzítése: csak beszerzés alatt lévő, átadás nélküli tételnél. */
export function canMarkDelivered(
  item: ProcurementPlanItem,
  ctx: ProcurementRuleContext,
  role: RoleKey,
): RuleResult {
  if (!isProcurementExecutor(role))
    return no("A beérkezést a beszerző rögzíti – Ön betekintő jogosultsággal nézi az ügyet.");
  if (handoverForItem(item, ctx.handovers ?? []))
    return no("A tételhez már tartozik átadási rekord a kari IT referensnél.");
  if (item.status !== "beszerzes_alatt")
    return no("Beérkezést csak beszerzés alatt lévő tételnél lehet rögzíteni.");
  return ok;
}

export type ProcurementActionKey = "hand_to_planner" | "start" | "deliver";

export interface ProcurementNextAction {
  /** Az állapothoz tartozó egyetlen elsődleges művelet, ha van. */
  key: ProcurementActionKey | null;
  label: string;
  /** Rövid magyarázat, ha a művelet éppen nem végezhető el. */
  hint: string;
  allowed: boolean;
}

/** Az adott állapothoz tartozó egyetlen elsődleges művelet. */
export function getProcurementNextAction(
  item: ProcurementPlanItem,
  ctx: ProcurementRuleContext,
  role: RoleKey,
): ProcurementNextAction {
  const handover = handoverForItem(item, ctx.handovers ?? []);
  if (handover)
    return {
      key: null,
      label: "",
      allowed: false,
      hint:
        handover.status === "atvetel_igazolva"
          ? "Lezárva – az eszköz átvétele visszaigazolva."
          : "Átadási folyamatban a kari IT referensnél.",
    };
  if (item.status === "teljesult")
    return { key: null, label: "", allowed: false, hint: "Teljesült." };

  if (!item.handedToPlannerAt) {
    const r = canHandToPlanner(item, role);
    return {
      key: "hand_to_planner",
      label: "Átadás eszközmenedzsernek",
      allowed: r.allowed,
      hint: r.reason ?? "",
    };
  }
  if (item.status !== "beszerzes_alatt") {
    const r = canStartProcurement(item, ctx, role);
    return {
      key: "start",
      label: "Beszerzés indítása",
      allowed: r.allowed,
      hint: r.reason ?? "",
    };
  }
  const r = canMarkDelivered(item, ctx, role);
  return {
    key: "deliver",
    label: "Beérkezett – átadásra",
    allowed: r.allowed,
    hint: r.reason ?? "",
  };
}
