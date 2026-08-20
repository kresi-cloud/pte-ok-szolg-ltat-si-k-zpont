export type RoleKey =
  | "igenylo"
  | "jovahagyo"
  | "ugyintezo"
  | "szolgaltatasgazda"
  | "vezeto"
  | "dekan"
  | "admin"
  | "beszerzo"
  | "gazdasagi_vezeto"
  | "superuser";

export const ROLE_LABELS: Record<RoleKey, string> = {
  igenylo: "Igénylő",
  jovahagyo: "Szervezeti jóváhagyó",
  ugyintezo: "Szolgáltatási ügyintéző",
  szolgaltatasgazda: "Szolgáltatásgazda",
  vezeto: "Kari vezető",
  dekan: "Dékán",
  admin: "Rendszeradminisztrátor",
  beszerzo: "Beszerző",
  gazdasagi_vezeto: "Gazdasági vezető",
  superuser: "Superuser (jogosultságkezelő)",
};

export const ROLE_DESCRIPTIONS: Record<RoleKey, string> = {
  igenylo: "Igényeket nyújt be, követi a saját ügyeit és leltárát.",
  jovahagyo: "Szervezeti egység nevében hagy jóvá igényeket.",
  ugyintezo: "Igényeket dolgoz fel a szolgáltatási munkatérben.",
  szolgaltatasgazda: "Szolgáltatás- és portfóliófelelős, kapacitás és SLA.",
  vezeto: "Kari szintű mutatókat és portfóliót lát.",
  dekan: "Teljes kari rálátás, bármely ügy eset szintre bontható.",
  admin: "Rendszerbeállítások, katalógus, leltárjóváhagyás.",
  beszerzo:
    "Megkapja a jóváhagyott eseti beszerzéseket, kezeli a negyedéves és éves beszerzési terveket.",
  gazdasagi_vezeto:
    "Az azonnali (eseti) beszerzéseket egy évre előre negyedéves tervblokkokba ütemezi.",
  superuser: "Kizárólagos jog a felhasználói jogosultságok kiosztására.",
};

/** Jogosultság-kiosztási naplóbejegyzés (ki, kinek, mit, mikor, miért). */
export interface RoleAuditEvent {
  id: string;
  at: string;
  actorId: string;
  targetUserId: string;
  action: "megadva" | "visszavonva";
  role: RoleKey;
  reason: string;
}

export type DomainKey = "szoftver" | "hardver" | "web" | "digitalizacio";

export interface ServiceDomain {
  key: DomainKey;
  name: string;
  short: string;
  description: string;
  examples: string[];
  prefix: string;
}

export interface OrgUnit {
  id: string;
  name: string;
  type: "hivatal" | "intezet" | "oktatas" | "kutatas" | "klinikai";
  approverUserId?: string | undefined;
}

export interface User {
  id: string;
  name: string;
  title: string;
  email: string;
  employeeId: string;
  orgUnitId: string;
  roles: RoleKey[];
  managerId?: string | undefined;
  teamId?: string | undefined;
  initials: string;
}

export interface ServiceTeam {
  id: string;
  name: string;
  domain: DomainKey;
  ownerUserId: string;
  members: string[];
}

export interface CatalogItem {
  id: string;
  name: string;
  domain: DomainKey;
  description: string;
  whoCanRequest: string;
  deliveryTime: string;
  approvals: string[];
  requiredInfo: string[];
  teamId: string;
  sla: string;
  keywords: string[];
}

export type StatusKey =
  | "piszkozat"
  | "bekuldve"
  | "elso_ertekeles"
  | "pontositas"
  | "jovahagyasra_var"
  | "elfogadva"
  | "tervezes"
  | "megvalositas"
  | "teszteles"
  | "atadasra_var"
  | "lezarva"
  | "elutasitva";

export const STATUS_ORDER: StatusKey[] = [
  "piszkozat",
  "bekuldve",
  "elso_ertekeles",
  "pontositas",
  "jovahagyasra_var",
  "elfogadva",
  "tervezes",
  "megvalositas",
  "teszteles",
  "atadasra_var",
  "lezarva",
  "elutasitva",
];

export const STATUS_LABELS: Record<StatusKey, string> = {
  piszkozat: "Piszkozat",
  bekuldve: "Beküldve",
  elso_ertekeles: "Első értékelés",
  pontositas: "Pontosítás szükséges",
  jovahagyasra_var: "Jóváhagyásra vár",
  elfogadva: "Elfogadva",
  tervezes: "Tervezés alatt",
  megvalositas: "Megvalósítás alatt",
  teszteles: "Tesztelés",
  atadasra_var: "Átadásra vár",
  lezarva: "Lezárva",
  elutasitva: "Elutasítva",
};

export type Priority = "alacsony" | "kozepes" | "magas" | "kritikus";

export interface RequestMessage {
  id: string;
  authorId: string;
  createdAt: string;
  body: string;
  internal: boolean;
}

export interface Approval {
  id: string;
  step: number;
  role: string;
  approverId: string;
  decision: "jovahagyva" | "elutasitva" | "fuggoben" | "pontositas";
  decidedAt?: string | undefined;
  comment?: string | undefined;
}

export interface AuditEvent {
  id: string;
  at: string;
  actorId: string;
  action: string;
  detail: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  uploaderId: string;
}

export interface SubTask {
  id: string;
  title: string;
  assigneeId?: string | undefined;
  done: boolean;
}

export interface AiTriage {
  category: string;
  subtype: string;
  team: string;
  complexity: "egyszerű" | "közepes" | "összetett";
  workflow: string;
  approvalNeeded: boolean;
  duplicateOf?: string | undefined;
  projectCandidate: boolean;
  confidence: number;
}

export interface ServiceRequest {
  id: string;
  title: string;
  domain: DomainKey;
  catalogItemId?: string | undefined;
  goal: string;
  requesterId: string;
  orgUnitId: string;
  teamId?: string | undefined;
  assigneeId?: string | undefined;
  status: StatusKey;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  dueDate?: string | undefined;
  estimatedCost?: number | undefined;
  effortDays?: number | undefined;
  nextStep: string;
  users?: string | undefined;
  userCount?: string | undefined;
  personalData?: boolean | undefined;
  integration?: string | undefined;
  recurring?: string | undefined;
  budget?: string | undefined;
  slaRisk?: boolean | undefined;
  projectId?: string | undefined;
  messages: RequestMessage[];
  approvals: Approval[];
  audit: AuditEvent[];
  attachments: Attachment[];
  subtasks: SubTask[];
  ai?: AiTriage | undefined;
  internal?: {
    classification: string;
    dependencies: string;
    procurement: boolean;
    security: string;
    dataProtection: string;
  } | undefined;
  rating?: number | undefined;
}

export type ProjectStage =
  | "otlet"
  | "eloszures"
  | "koncepcio"
  | "prioritas"
  | "tervezes"
  | "fejlesztes"
  | "teszteles"
  | "bevezetes"
  | "lezaras";

export const PROJECT_STAGES: { key: ProjectStage; label: string }[] = [
  { key: "otlet", label: "Ötlet" },
  { key: "eloszures", label: "Előszűrés" },
  { key: "koncepcio", label: "Koncepció" },
  { key: "prioritas", label: "Prioritási döntés" },
  { key: "tervezes", label: "Tervezés" },
  { key: "fejlesztes", label: "Fejlesztés" },
  { key: "teszteles", label: "Tesztelés" },
  { key: "bevezetes", label: "Bevezetés" },
  { key: "lezaras", label: "Lezárás" },
];

export interface Project {
  id: string;
  name: string;
  strategicRelevance: "alacsony" | "közepes" | "magas" | "kiemelt";
  ownerId: string;
  sponsorId: string;
  teamId: string;
  stage: ProjectStage;
  benefit: string;
  estimatedCost: number;
  effortDays: number;
  dependencies: string[];
  targetDate: string;
  risk: "alacsony" | "közepes" | "magas";
  orgUnitId: string;
  linkedRequestIds: string[];
}

export interface ResponsibilityRow {
  service: string;
  unit: string;
  ownerId: string;
  team: string;
  approver: string;
  supporting: string;
  sla: string;
  escalation: string;
}

export interface AppNotification {
  id: string;
  requestId?: string | undefined;
  text: string;
  at: string;
  read: boolean;
}

export type InventoryKind = "hardver" | "szoftver";

export type InventoryStatus = "jovahagyasra_var" | "jovahagyva" | "elutasitva";

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  jovahagyasra_var: "Jóváhagyásra vár",
  jovahagyva: "Jóváhagyva",
  elutasitva: "Elutasítva",
};

export interface HardwareSpec {
  os: string;
  osVersion: string;
  cpu: string;
  cpuCores: number;
  ram: string;
  storage: string;
  features: string[];
}

export interface InventoryItem {
  id: string;
  ownerId: string;
  kind: InventoryKind;
  name: string;
  /** hardver: modellkulcs a felismerési adatbázisból; szoftver: verzió */
  modelKey?: string | undefined;
  serial?: string | undefined;
  /** PTE intézményi leltárkód (leltári szám) */
  inventoryNo?: string | undefined;
  location?: string | undefined;
  /** nem mobil eszköz esetén kötelező elhelyezés */
  building?: string | undefined;
  room?: string | undefined;
  note?: string | undefined;
  /** szoftver mezők */
  version?: string | undefined;
  licenseType?: string | undefined;
  licenseKey?: string | undefined;
  installedOn?: string | undefined;
  /** hardver: automatikusan hozzárendelt műszaki adatok */
  spec?: HardwareSpec | undefined;
  status: InventoryStatus;
  createdAt: string;
  decidedAt?: string | undefined;
  decidedBy?: string | undefined;
  decisionComment?: string | undefined;
}

export type AnnouncementLevel = "info" | "figyelmeztetes" | "fontos";

export const ANNOUNCEMENT_LEVEL_LABELS: Record<AnnouncementLevel, string> = {
  info: "Információ",
  figyelmeztetes: "Figyelmeztetés",
  fontos: "Fontos",
};

/** Minden felhasználónak szóló portálhír, lejárati idővel. */
export interface Announcement {
  id: string;
  title: string;
  body: string;
  level: AnnouncementLevel;
  publishedAt: string;
  /** ISO dátum (YYYY-MM-DD); a lejárat napjának végéig látszik */
  expiresAt: string;
  active: boolean;
  createdBy: string;
}
