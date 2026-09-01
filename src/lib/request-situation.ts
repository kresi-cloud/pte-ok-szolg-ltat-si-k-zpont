import type { PlanApproval, ProcurementPlanItem } from "./asset-types";
import { PLAN_APPROVAL_STATUS_LABELS } from "./asset-types";
import type { AssetHandover, RoleKey, ServiceRequest, User } from "./types";
import { ROLE_LABELS, STATUS_LABELS } from "./types";
import { planApprovalForItem } from "./withdraw";
import { planApprovalApproved } from "./procurement-rules";

/**
 * Az ügy jelenlegi helyzetének egységes összefoglalója.
 * Ugyanezt használja az igény oldali helyzetkártya és a lezárási összegzés.
 */

export interface SituationContext {
  planItems: ProcurementPlanItem[];
  planApprovals: PlanApproval[];
  handovers: AssetHandover[];
  users: User[];
}

export interface TrackStage {
  label: string;
  done: boolean;
  current: boolean;
}

export interface RequestSituation {
  statusLabel: string;
  /** Ki a jelenlegi felelős (személy vagy szerepkör). */
  owner: string;
  /** Kire vár a folyamat. */
  waitingOn: string;
  /** A következő szükséges döntés vagy művelet. */
  nextAction: string;
  /** Becsült bruttó költség forintban. */
  grossCost: number;
  approvalsDone: number;
  approvalsTotal: number;
  track: TrackStage[];
  /** A következő műveletre jogosult felhasználó azonosítója, ha ismert. */
  nextActorId?: string;
  closed: boolean;
}

const STAGES = [
  "Tervsor",
  "Gazdasági ellenőrzés",
  "Dékáni jóváhagyás",
  "Beszerzés",
  "Átadás",
  "Átvétel",
];

function userName(users: User[], id?: string): string {
  return users.find((u) => u.id === id)?.name ?? "Kijelölés alatt";
}

function byRole(users: User[], role: RoleKey): User | undefined {
  return users.find((u) => u.roles.includes(role));
}

export function requestSituation(request: ServiceRequest, ctx: SituationContext): RequestSituation {
  const users = ctx.users;
  const planItem = ctx.planItems.find((p) => p.sourceRequestId === request.id);
  const handover = (ctx.handovers ?? []).find(
    (h) => h.requestId === request.id || (planItem && h.planItemId === planItem.id),
  );
  const approval = planItem ? planApprovalForItem(planItem, ctx.planApprovals ?? []) : undefined;
  const approved = planApprovalApproved(approval);
  const pending = request.approvals.filter((a) => a.decision === "fuggoben");
  const approvalsDone = request.approvals.filter((a) => a.decision === "jovahagyva").length;

  const grossCost = planItem
    ? (planItem.unitPriceOverride ?? 0) * planItem.quantity
    : (request.estimatedCost ?? 0);

  let stageIndex = 0;
  let owner = "";
  let waitingOn = "";
  let nextAction = "";
  let nextActorId: string | undefined;
  const closed = handover?.status === "atvetel_igazolva" || request.status === "lezarva";

  if (pending.length > 0) {
    const next = pending[0]!;
    owner = userName(users, next.approverId);
    waitingOn = `${owner} – ${ROLE_LABELS[next.role as RoleKey] ?? next.role}`;
    nextAction =
      next.step === 1 ? "Bruttó költségkeret rögzítése és jóváhagyás" : "Szakmai jóváhagyás";
    nextActorId = next.approverId;
  } else if (!planItem) {
    const staff = byRole(users, "szolgaltatasgazda") ?? byRole(users, "ugyintezo");
    owner = staff?.name ?? "Szolgáltatási ügyintéző";
    waitingOn = `${owner} – szolgáltatási ügyintéző`;
    nextAction = "Beszerzési tervsor létrehozása";
    nextActorId = staff?.id;
  } else if (closed) {
    stageIndex = STAGES.length;
    owner = "Nincs felelős – az ügy lezárult.";
    waitingOn = "Nincs nyitott teendő.";
    nextAction = "Az igény lezárult, az eszköz a személyi leltárban van.";
  } else if (handover) {
    stageIndex = handover.status === "atadva" ? 5 : 4;
    if (handover.status === "atadva") {
      owner = userName(users, handover.recipientId);
      waitingOn = `${owner} – igénylő`;
      nextAction = "Átvétel visszaigazolása";
      nextActorId = handover.recipientId;
    } else {
      const ref = handover.referentId ?? byRole(users, "it_referens")?.id;
      owner = userName(users, ref);
      waitingOn = `${owner} – ${ROLE_LABELS.it_referens}`;
      nextAction = "Telepítés, checklist és átadás az igénylőnek";
      nextActorId = ref;
    }
  } else if (planItem.status === "beszerzes_alatt") {
    stageIndex = 3;
    const buyer = byRole(users, "beszerzo");
    owner = buyer?.name ?? "Beszerző";
    waitingOn = `${owner} – ${ROLE_LABELS.beszerzo}`;
    nextAction = "Az eszköz beérkezésének rögzítése";
    nextActorId = buyer?.id;
  } else if (approved) {
    stageIndex = 3;
    const buyer = byRole(users, "beszerzo");
    owner = buyer?.name ?? "Beszerző";
    waitingOn = `${owner} – ${ROLE_LABELS.beszerzo}`;
    nextAction = "Beszerzés indítása";
    nextActorId = buyer?.id;
  } else if (
    approval?.status === "gazdasagi_ellenorzes" ||
    approval?.status === "dekani_jovahagyas" ||
    approval?.status === "jovahagyasra_var"
  ) {
    stageIndex = 1;
    const fin = byRole(users, "gazdasagi_vezeto");
    owner = fin?.name ?? "Gazdasági vezető";
    waitingOn = `${owner} – ${ROLE_LABELS.gazdasagi_vezeto}`;
    nextAction = "Gazdasági ellenőrzés és továbbítás dékáni jóváhagyásra";
    nextActorId = fin?.id;
  } else if (!planItem.handedToPlannerAt) {
    stageIndex = 0;
    const buyer = byRole(users, "beszerzo");
    owner = buyer?.name ?? "Beszerző";
    waitingOn = `${owner} – ${ROLE_LABELS.beszerzo}`;
    nextAction = "Tétel átadása az IT eszközmenedzsernek";
    nextActorId = buyer?.id;
  } else {
    stageIndex = 1;
    const planner = byRole(users, "eszkozmenedzser");
    owner = planner?.name ?? "IT eszközmenedzser";
    waitingOn = `${owner} – ${ROLE_LABELS.eszkozmenedzser}`;
    nextAction = `Ütemezés és beküldés gazdasági ellenőrzésre${
      approval ? ` (${PLAN_APPROVAL_STATUS_LABELS[approval.status]})` : ""
    }`;
    nextActorId = planner?.id;
  }

  return {
    statusLabel: STATUS_LABELS[request.status],
    owner,
    waitingOn,
    nextAction,
    grossCost,
    approvalsDone,
    approvalsTotal: request.approvals.length,
    track: STAGES.map((label, i) => ({
      label,
      done: i < stageIndex,
      current: i === stageIndex,
    })),
    ...(nextActorId ? { nextActorId } : {}),
    closed,
  };
}
