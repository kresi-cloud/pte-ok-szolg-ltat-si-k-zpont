import type { PlanApproval, ProcurementPlanItem } from "./asset-types";
import type { AssetHandover, RoleKey, User } from "./types";
import { ROLE_LABELS } from "./types";
import { handoverConfigured, planApprovalApproved } from "./procurement-rules";
import { PROCESS_STEPS, STEP } from "./process-steps";

/**
 * A tervsor levezetett folyamatlépcsője a központi nyolclépcsős modellben.
 * A tárolt `status` mező önmagában nem mutatja a valós előrehaladást, ezért
 * minden felület ebből az egyetlen függvényből veszi az állapotot.
 */
export interface PlanItemStage {
  /** Emberi nyelvű lépcsőnév. */
  label: string;
  /** A nyolclépcsős folyamat lépésneve. */
  stepLabel: string;
  /** Kire vár a folyamat (név + beosztás). */
  waitingOn: string;
  /** A soron következő szükséges művelet. */
  nextAction: string;
  /** A soron következő szereplő azonosítója, ha ismert. */
  actorId?: string;
  /** 0-alapú lépésindex a nyolclépcsős folyamatban. */
  stageIndex: number;
  done: boolean;
}

function byRole(users: User[], role: RoleKey): User | undefined {
  return users.find((u) => u.roles.includes(role));
}

function waiting(users: User[], role: RoleKey, fallback: string) {
  const u = byRole(users, role);
  return {
    waitingOn: `${u?.name ?? fallback} – ${ROLE_LABELS[role]}`,
    ...(u ? { actorId: u.id } : {}),
  };
}

function step(index: number) {
  return { stageIndex: index, stepLabel: PROCESS_STEPS[index]! };
}

export function planItemStage(
  item: ProcurementPlanItem,
  approval: PlanApproval | undefined,
  handover: AssetHandover | undefined,
  users: User[],
): PlanItemStage {
  const approved = planApprovalApproved(approval);

  if (handover?.status === "atvetel_igazolva" || item.status === "teljesult") {
    return {
      ...step(STEP.atvetel),
      label: "Teljesült – az eszköz a leltárban",
      nextAction: "Az igény lezárult, az eszköz a személyi leltárban van.",
      waitingOn: "Nincs nyitott teendő.",
      done: true,
    };
  }
  if (handover) {
    if (handover.status === "atadva") {
      const rec = users.find((u) => u.id === handover.recipientId);
      return {
        ...step(STEP.atvetel),
        label: "Átadva – átvételi visszaigazolásra vár",
        nextAction: "Átvétel visszaigazolása és ügy lezárása",
        waitingOn: `${rec?.name ?? "Igénylő"} – ${ROLE_LABELS.igenylo}`,
        ...(rec ? { actorId: rec.id } : {}),
        done: false,
      };
    }
    if (handoverConfigured(handover)) {
      return {
        ...step(STEP.eszkozatadas),
        label: "Konfigurálva – átadásra kész",
        nextAction: "Eszköz átadása az igénylőnek",
        ...waiting(users, "it_referens", "Kari IT referens"),
        done: false,
      };
    }
    return {
      ...step(STEP.konfiguralas),
      label: "Konfigurálás alatt",
      nextAction: "Telepítés, checklist, gyári szám, leltárkód és fénykép rögzítése",
      ...waiting(users, "it_referens", "Kari IT referens"),
      done: false,
    };
  }
  if (item.status === "beszerzes_alatt") {
    return {
      ...step(STEP.beszerzes),
      label: "Beszerzés alatt – beérkezésre vár",
      nextAction: "Az eszköz beérkezésének rögzítése",
      ...waiting(users, "beszerzo", "Beszerző"),
      done: false,
    };
  }
  if (approved || item.status === "jovahagyva") {
    return {
      ...step(STEP.beszerzes),
      label: "Jóváhagyva – beszerzés indítható",
      nextAction: "Beszerzés indítása",
      ...waiting(users, "beszerzo", "Beszerző"),
      done: false,
    };
  }
  if (
    approval?.status === "gazdasagi_ellenorzes" ||
    approval?.status === "dekani_jovahagyas" ||
    approval?.status === "jovahagyasra_var"
  ) {
    return {
      ...step(STEP.gazdasagi_jovahagyas),
      label: "Gazdasági vezetői jóváhagyásra vár",
      nextAction: "Beszerzési terv gazdasági vezetői jóváhagyása",
      ...waiting(users, "gazdasagi_vezeto", "Gazdasági vezető"),
      done: false,
    };
  }
  if (approval?.status === "visszakuldve") {
    return {
      ...step(STEP.it_besorolas),
      label: "Átdolgozásra visszaküldve",
      nextAction: "Besorolás átdolgozása és ismételt beküldése",
      ...waiting(users, "eszkozmenedzser", "IT eszközmenedzser"),
      done: false,
    };
  }
  return {
    ...step(STEP.it_besorolas),
    label: "IT besorolás alatt",
    nextAction: "Besorolás, ütemezés és beküldés gazdasági jóváhagyásra",
    ...waiting(users, "eszkozmenedzser", "IT eszközmenedzser"),
    done: false,
  };
}
