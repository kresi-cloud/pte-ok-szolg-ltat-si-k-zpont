import type { PlanApproval, ProcurementPlanItem } from "./asset-types";
import type { AssetHandover, RoleKey, User } from "./types";
import { ROLE_LABELS } from "./types";
import { planApprovalApproved } from "./procurement-rules";

/**
 * A tervsor levezetett folyamatlépcsője.
 * A tárolt `status` mező önmagában nem mutatja a valós előrehaladást
 * (tervezés, eszközmenedzseri szakasz, gazdasági jóváhagyás), ezért a
 * megjelenítés mindenhol ebből a közös függvényből származik.
 */
export interface PlanItemStage {
  /** Emberi nyelvű lépcsőnév. */
  label: string;
  /** Kire vár a folyamat (név + beosztás). */
  waitingOn: string;
  /** A soron következő szükséges művelet. */
  nextAction: string;
  /** A soron következő szereplő azonosítója, ha ismert. */
  actorId?: string;
  /** Sorszám a Tervsor → Gazdasági jóváhagyás → Beszerzés → Átadás → Átvétel sávban. */
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

export function planItemStage(
  item: ProcurementPlanItem,
  approval: PlanApproval | undefined,
  handover: AssetHandover | undefined,
  users: User[],
): PlanItemStage {
  const approved = planApprovalApproved(approval);

  if (handover?.status === "atvetel_igazolva" || item.status === "teljesult") {
    return {
      label: "Teljesült – az eszköz a leltárban",
      nextAction: "Az igény lezárult, az eszköz a személyi leltárban van.",
      waitingOn: "Nincs nyitott teendő.",
      stageIndex: 5,
      done: true,
    };
  }
  if (handover) {
    if (handover.status === "atadva") {
      const rec = users.find((u) => u.id === handover.recipientId);
      return {
        label: "Átadva – átvételi visszaigazolásra vár",
      nextAction: "Átvétel visszaigazolása",
        waitingOn: `${rec?.name ?? "Igénylő"} – ${ROLE_LABELS.igenylo}`,
        ...(rec ? { actorId: rec.id } : {}),
        stageIndex: 4,
        done: false,
      };
    }
    return {
      label: "Átadás előkészítés alatt",
      nextAction: "Telepítés, checklist és átadás az igénylőnek",
      ...waiting(users, "it_referens", "Kari IT referens"),
      stageIndex: 3,
      done: false,
    };
  }
  if (item.status === "beszerzes_alatt") {
    return {
      label: "Beszerzés alatt – beérkezésre vár",
      nextAction: "Az eszköz beérkezésének rögzítése",
      ...waiting(users, "beszerzo", "Beszerző"),
      stageIndex: 2,
      done: false,
    };
  }
  if (approved || item.status === "jovahagyva") {
    return {
      label: "Jóváhagyva – beszerzés indítható",
      nextAction: "Beszerzés indítása",
      ...waiting(users, "beszerzo", "Beszerző"),
      stageIndex: 2,
      done: false,
    };
  }
  if (
    approval?.status === "gazdasagi_ellenorzes" ||
    approval?.status === "dekani_jovahagyas" ||
    approval?.status === "jovahagyasra_var"
  ) {
    return {
      label: "Gazdasági vezetői jóváhagyásra vár",
      nextAction: "Beszerzési terv gazdasági vezetői jóváhagyása",
      ...waiting(users, "gazdasagi_vezeto", "Gazdasági vezető"),
      stageIndex: 1,
      done: false,
    };
  }
  if (approval?.status === "visszakuldve") {
    return {
      label: "Átdolgozásra visszaküldve",
      nextAction: "Terv átdolgozása és ismételt beküldése",
      ...waiting(users, "eszkozmenedzser", "IT eszközmenedzser"),
      stageIndex: 1,
      done: false,
    };
  }
  if (!item.handedToPlannerAt) {
    return {
      label: "Tervsoron – beszerzőnél átadásra vár",
      nextAction: "Tétel átadása az IT eszközmenedzsernek",
      ...waiting(users, "beszerzo", "Beszerző"),
      stageIndex: 0,
      done: false,
    };
  }
  return {
    label: "Eszközmenedzseri tervezés alatt",
      nextAction: "Ütemezés és beküldés gazdasági ellenőrzésre",
    ...waiting(users, "eszkozmenedzser", "IT eszközmenedzser"),
    stageIndex: 1,
    done: false,
  };
}
