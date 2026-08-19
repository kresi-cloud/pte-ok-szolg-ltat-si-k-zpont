import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CATALOG,
  ANNOUNCEMENTS,
  DOMAINS,
  NOTIFICATIONS,
  ORG_UNITS,
  PROJECTS,
  REQUESTS,
  RESPONSIBILITIES,
  TEAMS,
  USERS,
} from "./seed";
import type {
  Announcement,
  AppNotification,
  InventoryItem,
  Project,
  RequestMessage,
  RoleKey,
  RoleAuditEvent,
  ServiceRequest,
  StatusKey,
  User,
} from "./types";
import { INVENTORY, specForModel } from "./inventory-data";
import type {
  Asset,
  AssetAuditEvent,
  AssetEvent,
  DiscrepancyKind,
  InventoryCheck,
  InventoryDiscrepancy,
  PersonalSoftwareLicence,
  PersonalCheckAnswer,
  ProcurementPlanItem,
  ReplacementDecision,
  ReplacementDecisionKey,
  SharedCheckAnswer,
} from "./asset-types";
import {
  ASSETS,
  ASSET_ASSIGNMENTS,
  ASSET_EVENTS,
  INITIAL_ASSET_AUDIT,
  INITIAL_CHECKS,
  INITIAL_DISCREPANCIES,
  INITIAL_PROCUREMENT_ITEMS,
  INITIAL_REPLACEMENT_DECISIONS,
  PERSONAL_LICENCES,
} from "./asset-data";
import { needsProcurement, planItemFromRequest } from "./request-procurement";

const STORAGE_KEY = "aok-portal-state-v2";

interface PersistedState {
  requests: ServiceRequest[];
  notifications: AppNotification[];
  announcements: Announcement[];
  dismissedAnnouncements: string[];
  inventory: InventoryItem[];
  assets: Asset[];
  licences: PersonalSoftwareLicence[];
  assetEvents: AssetEvent[];
  assetAudit: AssetAuditEvent[];
  checks: InventoryCheck[];
  discrepancies: InventoryDiscrepancy[];
  replacementDecisions: ReplacementDecision[];
  planItems: ProcurementPlanItem[];
  currentUserId: string;
  activeRole: RoleKey;
  loggedIn: boolean;
  roleOverrides: Record<string, RoleKey[]>;
  roleAudit: RoleAuditEvent[];
}

const initialState: PersistedState = {
  requests: REQUESTS,
  notifications: NOTIFICATIONS,
  announcements: ANNOUNCEMENTS,
  dismissedAnnouncements: [],
  inventory: INVENTORY,
  assets: ASSETS,
  licences: PERSONAL_LICENCES,
  assetEvents: ASSET_EVENTS,
  assetAudit: INITIAL_ASSET_AUDIT,
  checks: INITIAL_CHECKS,
  discrepancies: INITIAL_DISCREPANCIES,
  replacementDecisions: INITIAL_REPLACEMENT_DECISIONS,
  planItems: INITIAL_PROCUREMENT_ITEMS,
  currentUserId: "u-kovacs",
  activeRole: "igenylo",
  loggedIn: false,
  roleOverrides: {},
  roleAudit: [],
};

interface StoreValue extends PersistedState {
  users: User[];
  projects: Project[];
  currentUser: User;
  login: (userId: string) => void;
  logout: () => void;
  setActiveRole: (role: RoleKey) => void;
  switchUser: (userId: string) => void;
  createRequest: (input: Partial<ServiceRequest> & { title: string; domain: ServiceRequest["domain"] }) => string;
  updateRequest: (id: string, patch: Partial<ServiceRequest>, auditLabel?: string) => void;
  setStatus: (id: string, status: StatusKey) => void;
  addMessage: (id: string, body: string, internal: boolean) => void;
  decideApproval: (id: string, approvalId: string, decision: "jovahagyva" | "elutasitva", comment?: string) => void;
  markNotificationsRead: () => void;
  rateRequest: (id: string, rating: number) => void;
  addInventoryItem: (input: Omit<InventoryItem, "id" | "ownerId" | "status" | "createdAt" | "spec">) => string;
  removeInventoryItem: (id: string) => void;
  decideInventoryItem: (id: string, decision: "jovahagyva" | "elutasitva", comment?: string) => void;
  assignments: typeof ASSET_ASSIGNMENTS;
  updateAsset: (id: string, patch: Partial<Asset>, label?: string) => void;
  submitCheck: (assetId: string, answer: PersonalCheckAnswer | SharedCheckAnswer, comment?: string) => void;
  reportDiscrepancy: (input: {
    kind: DiscrepancyKind;
    assetId?: string | undefined;
    licenceId?: string | undefined;
    description: string;
  }) => void;
  resolveDiscrepancy: (id: string, status: InventoryDiscrepancy["status"], resolution?: string) => void;
  decideReplacement: (assetId: string, decision: ReplacementDecisionKey, comment?: string) => void;
  markLicenceUnused: (licenceId: string, unused: boolean) => void;
  addPlanItem: (item: Omit<ProcurementPlanItem, "id">) => string;
  updatePlanItem: (id: string, patch: Partial<ProcurementPlanItem>) => void;
  removePlanItem: (id: string) => void;
  setUserRoles: (userId: string, roles: RoleKey[], reason: string) => void;
  activeAnnouncements: Announcement[];
  addAnnouncement: (input: Omit<Announcement, "id" | "publishedAt" | "createdBy">) => string;
  updateAnnouncement: (id: string, patch: Partial<Announcement>) => void;
  removeAnnouncement: (id: string) => void;
  dismissAnnouncement: (id: string) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Jóváhagyott igény bekötése a beszerzési tervbe: ha az igény beszerzést
 * igényel és még nincs hozzá tervsor, javaslatot hoz létre értesítéssel.
 */
function applyProcurementLink(
  s: PersistedState,
  requests: ServiceRequest[],
  request: ServiceRequest,
): PersistedState {
  const already = s.planItems.some((p) => p.sourceRequestId === request.id);
  if (already || !needsProcurement(request)) return { ...s, requests };
  const item: ProcurementPlanItem = {
    ...planItemFromRequest(request),
    id: `pp-req-${request.id}-${Date.now()}`,
  };
  return {
    ...s,
    requests,
    planItems: [item, ...s.planItems],
    notifications: [
      {
        id: `n-${Date.now()}`,
        requestId: request.id,
        at: today(),
        text: `A(z) „${request.title}” igény jóváhagyás után bekerült a ${item.planYear}. évi beszerzési tervbe (${item.quarter}), gazdasági jóváhagyásra vár.`,
        read: false,
      },
      ...s.notifications,
    ],
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PersistedState>;
        const merged = { ...initialState } as PersistedState;
        for (const [key, value] of Object.entries(saved)) {
          if (value === undefined || value === null) continue;
          const fallback = (initialState as unknown as Record<string, unknown>)[key];
          if (Array.isArray(fallback) && !Array.isArray(value)) continue;
          (merged as unknown as Record<string, unknown>)[key] = value;
        }
        setState(merged);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const effectiveUsers = useMemo(
    () =>
      USERS.map((u) =>
        state.roleOverrides[u.id] ? { ...u, roles: state.roleOverrides[u.id]! } : u,
      ),
    [state.roleOverrides],
  );

  const currentUser = useMemo(
    () => effectiveUsers.find((u) => u.id === state.currentUserId) ?? effectiveUsers[0]!,
    [effectiveUsers, state.currentUserId],
  );

  const patchRequest = useCallback(
    (id: string, fn: (r: ServiceRequest) => ServiceRequest) => {
      setState((s) => ({
        ...s,
        requests: s.requests.map((r) => (r.id === id ? fn(r) : r)),
      }));
    },
    [],
  );

  const value: StoreValue = {
    ...state,
    users: effectiveUsers,
    projects: PROJECTS,
    currentUser,
    login: (userId) =>
      setState((s) => {
        const u = effectiveUsers.find((x) => x.id === userId) ?? effectiveUsers[0]!;
        return { ...s, loggedIn: true, currentUserId: u.id, activeRole: u.roles[0]! };
      }),
    logout: () => setState((s) => ({ ...s, loggedIn: false })),
    setActiveRole: (role) => setState((s) => ({ ...s, activeRole: role })),
    switchUser: (userId) =>
      setState((s) => {
        const u = effectiveUsers.find((x) => x.id === userId) ?? effectiveUsers[0]!;
        return { ...s, currentUserId: u.id, activeRole: u.roles[0]! };
      }),
    createRequest: (input) => {
      const domain = DOMAINS.find((d) => d.key === input.domain)!;
      const seqNo = 300 + Math.floor(Math.random() * 600);
      const id = `${domain.prefix}-2026-0${seqNo}`;
      const team = TEAMS.find((t) => t.domain === domain.key)!;
      const draft = input.status === "piszkozat";
      const req: ServiceRequest = {
        id,
        title: input.title,
        domain: domain.key,
        catalogItemId: input.catalogItemId,
        goal: input.goal ?? "",
        requesterId: currentUser.id,
        orgUnitId: currentUser.orgUnitId,
        teamId: team.id,
        assigneeId: undefined,
        status: input.status ?? "bekuldve",
        priority: input.priority ?? "kozepes",
        createdAt: today(),
        updatedAt: today(),
        dueDate: input.dueDate,
        estimatedCost: input.estimatedCost ?? 0,
        effortDays: 5,
        nextStep: draft
          ? "Piszkozat – beküldésre vár."
          : "Beérkezett igény első értékelésre vár.",
        users: input.users,
        userCount: input.userCount,
        personalData: input.personalData,
        integration: input.integration,
        recurring: input.recurring,
        budget: input.budget,
        slaRisk: false,
        projectId: undefined,
        messages: input.goal
          ? [
              {
                id: `m-${Date.now()}`,
                authorId: currentUser.id,
                createdAt: today(),
                body: input.goal,
                internal: false,
              },
            ]
          : [],
        approvals: draft
          ? []
          : [
              {
                id: `ap-${Date.now()}`,
                step: 1,
                role: "Szervezeti jóváhagyó",
                approverId:
                  ORG_UNITS.find((o) => o.id === currentUser.orgUnitId)?.approverUserId ?? "u-nagy",
                decision: "fuggoben",
              },
              {
                id: `ap2-${Date.now()}`,
                step: 2,
                role: "Szolgáltatásgazda",
                approverId: TEAMS.find((t) => t.id === team.id)!.ownerUserId,
                decision: "fuggoben",
              },
            ],
        audit: [
          {
            id: `a-${Date.now()}`,
            at: today(),
            actorId: currentUser.id,
            action: draft ? "Piszkozat mentése" : "Igény beküldése",
            detail: `${id} létrehozva`,
          },
        ],
        attachments: [],
        subtasks: [],
        ai: input.ai,
        internal: {
          classification: `${domain.name} / új igény`,
          dependencies: "Még nem vizsgált.",
          procurement: (input.estimatedCost ?? 0) > 300000,
          security: "Ellenőrzés szükséges",
          dataProtection: input.personalData ? "Adatvédelmi vizsgálat szükséges" : "Nem érintett",
        },
        rating: undefined,
      };
      setState((s) => ({
        ...s,
        requests: [req, ...s.requests],
        notifications: draft
          ? s.notifications
          : [
              {
                id: `n-${Date.now()}`,
                requestId: id,
                text: `${id} – az igény beérkezett, első értékelés folyamatban`,
                at: today(),
                read: false,
              },
              ...s.notifications,
            ],
      }));
      return id;
    },
    updateRequest: (id, patch, auditLabel) =>
      patchRequest(id, (r) => ({
        ...r,
        ...patch,
        updatedAt: today(),
        audit: auditLabel
          ? [
              ...r.audit,
              {
                id: `a-${Date.now()}`,
                at: today(),
                actorId: currentUser.id,
                action: auditLabel,
                detail: Object.keys(patch).join(", "),
              },
            ]
          : r.audit,
      })),
    setStatus: (id, status) =>
      setState((s) => {
        const requests = s.requests.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                updatedAt: today(),
                audit: [
                  ...r.audit,
                  {
                    id: `a-${Date.now()}`,
                    at: today(),
                    actorId: currentUser.id,
                    action: "Státuszváltás",
                    detail: status,
                  },
                ],
              }
            : r,
        );
        const updated = requests.find((r) => r.id === id);
        return status === "elfogadva" && updated
          ? applyProcurementLink(s, requests, updated)
          : { ...s, requests };
      }),
    addMessage: (id, body, internal) => {
      const message: RequestMessage = {
        id: `m-${Date.now()}`,
        authorId: currentUser.id,
        createdAt: today(),
        body,
        internal,
      };
      patchRequest(id, (r) => ({
        ...r,
        updatedAt: today(),
        messages: [...r.messages, message],
        audit: [
          ...r.audit,
          {
            id: `a-${Date.now()}`,
            at: today(),
            actorId: currentUser.id,
            action: internal ? "Belső megjegyzés" : "Üzenet az igénylőnek",
            detail: body.slice(0, 60),
          },
        ],
      }));
    },
    decideApproval: (id, approvalId, decision, comment) =>
      setState((s) => {
        let approvedNow = false;
        const requests = s.requests.map((r) => {
          if (r.id !== id) return r;
          const approvals = r.approvals.map((a) =>
            a.id === approvalId ? { ...a, decision, decidedAt: today(), comment } : a,
          );
          const rejected = decision === "elutasitva";
          const allDone = approvals.every((a) => a.decision === "jovahagyva");
          approvedNow = !rejected && allDone;
          return {
            ...r,
            approvals,
            status: (rejected ? "elutasitva" : allDone ? "elfogadva" : r.status) as StatusKey,
            nextStep: rejected
              ? "Elutasítva."
              : allDone
                ? "Jóváhagyva, végrehajtás tervezése következik."
                : "További jóváhagyásra vár.",
            updatedAt: today(),
            audit: [
              ...r.audit,
              {
                id: `a-${Date.now()}`,
                at: today(),
                actorId: currentUser.id,
                action: rejected ? "Elutasítás" : "Jóváhagyás",
                detail: comment ?? "",
              },
            ],
          };
        });
        const updated = requests.find((r) => r.id === id);
        return approvedNow && updated
          ? applyProcurementLink(s, requests, updated)
          : { ...s, requests };
      }),
    markNotificationsRead: () =>
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      })),
    rateRequest: (id, rating) => patchRequest(id, (r) => ({ ...r, rating })),
    addInventoryItem: (input) => {
      const id = `inv-${Date.now()}`;
      const item: InventoryItem = {
        ...input,
        id,
        ownerId: currentUser.id,
        status: "jovahagyasra_var",
        createdAt: today(),
        spec: input.kind === "hardver" ? specForModel(input.modelKey) : undefined,
      };
      setState((s) => ({
        ...s,
        inventory: [item, ...s.inventory],
        notifications: [
          {
            id: `n-${Date.now()}`,
            text: `${item.name} felvéve a személyi leltárba – rendszergazdai jóváhagyásra vár`,
            at: today(),
            read: false,
          },
          ...s.notifications,
        ],
      }));
      return id;
    },
    removeInventoryItem: (id) =>
      setState((s) => ({ ...s, inventory: s.inventory.filter((i) => i.id !== id) })),
    decideInventoryItem: (id, decision, comment) =>
      setState((s) => {
        const item = s.inventory.find((i) => i.id === id);
        const label = decision === "jovahagyva" ? "jóváhagyva" : "elutasítva";
        return {
          ...s,
          inventory: s.inventory.map((i) =>
            i.id === id
              ? { ...i, status: decision, decidedAt: today(), decidedBy: currentUser.id, decisionComment: comment }
              : i,
          ),
          assetAudit: [
            {
              id: `aud-${Date.now()}`,
              at: today(),
              actorId: currentUser.id,
              entity: "leltar",
              entityId: id,
              action: `Személyi leltártétel ${label}`,
              detail: `${item?.name ?? id}${comment ? ` · ${comment}` : ""}`,
            },
            ...s.assetAudit,
          ],
          notifications: [
            {
              id: `n-${Date.now()}`,
              at: today(),
              read: false,
              text: `„${item?.name ?? "Leltártétel"}” személyi leltártétel ${label}${comment ? ` – ${comment}` : ""}`,
            },
            ...s.notifications,
          ],
        };
      }),
    assignments: ASSET_ASSIGNMENTS,
    updateAsset: (id, patch, label) =>
      setState((s) => ({
        ...s,
        assets: s.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        assetEvents: [
          ...s.assetEvents,
          {
            id: `ae-${Date.now()}`,
            assetId: id,
            at: today(),
            type: "muszaki_adat",
            actorId: currentUser.id,
            title: label ?? "Eszközadat módosítása",
            detail: Object.keys(patch).join(", "),
          },
        ],
        assetAudit: [
          {
            id: `aud-${Date.now()}`,
            at: today(),
            actorId: currentUser.id,
            entity: "asset",
            entityId: id,
            action: label ?? "Eszközadat módosítása",
            detail: Object.keys(patch).join(", "),
          },
          ...s.assetAudit,
        ],
      })),
    submitCheck: (assetId, answer, comment) =>
      setState((s) => ({
        ...s,
        checks: [
          {
            id: `chk-${Date.now()}`,
            assetId,
            cycle: "2026. évi leltár",
            userId: currentUser.id,
            answer,
            at: today(),
            comment,
            stage: "leltarfelelos_ellenorzes",
          },
          ...s.checks.filter((c) => !(c.assetId === assetId && c.userId === currentUser.id)),
        ],
        assetEvents: [
          ...s.assetEvents,
          {
            id: `ae-${Date.now()}`,
            assetId,
            at: today(),
            type: "leltar_ellenorzes",
            actorId: currentUser.id,
            title: "Leltárellenőrzés visszaigazolása",
            detail: answer,
          },
        ],
      })),
    reportDiscrepancy: (input) =>
      setState((s) => ({
        ...s,
        discrepancies: [
          {
            id: `dis-${Date.now()}`,
            kind: input.kind,
            assetId: input.assetId,
            licenceId: input.licenceId,
            reportedBy: currentUser.id,
            at: today(),
            description: input.description,
            status: "nyitott",
          },
          ...s.discrepancies,
        ],
        notifications: [
          {
            id: `n-${Date.now()}`,
            text: "Leltári eltérés bejelentve – leltárfelelős ellenőrzésére vár",
            at: today(),
            read: false,
          },
          ...s.notifications,
        ],
      })),
    resolveDiscrepancy: (id, status, resolution) =>
      setState((s) => ({
        ...s,
        discrepancies: s.discrepancies.map((d) =>
          d.id === id ? { ...d, status, resolution, handledBy: currentUser.id } : d,
        ),
        assetAudit: [
          {
            id: `aud-${Date.now()}`,
            at: today(),
            actorId: currentUser.id,
            entity: "leltar",
            entityId: id,
            action: `Leltári eltérés státusza: ${status}`,
            detail: resolution ?? "",
          },
          ...s.assetAudit,
        ],
        notifications: [
          {
            id: `n-${Date.now()}`,
            at: today(),
            read: false,
            text: `Leltári eltérés lezárva (${status})${resolution ? ` – ${resolution}` : ""}`,
          },
          ...s.notifications,
        ],
      })),
    decideReplacement: (assetId, decision, comment) =>
      setState((s) => ({
        ...s,
        replacementDecisions: [
          { assetId, decision, decidedBy: currentUser.id, decidedAt: today(), comment },
          ...s.replacementDecisions.filter((d) => d.assetId !== assetId),
        ],
        assetEvents: [
          ...s.assetEvents,
          {
            id: `ae-${Date.now()}`,
            assetId,
            at: today(),
            type: "csere_dontes",
            actorId: currentUser.id,
            title: "Csereigény döntés",
            detail: decision,
          },
        ],
      })),
    markLicenceUnused: (licenceId, unused) =>
      setState((s) => ({
        ...s,
        licences: s.licences.map((l) => (l.id === licenceId ? { ...l, reportedUnused: unused } : l)),
        assetAudit: [
          {
            id: `aud-${Date.now()}`,
            at: today(),
            actorId: currentUser.id,
            entity: "licenc",
            entityId: licenceId,
            action: unused ? "Licenc nem használtnak jelölve" : "Licenc újra használatban",
            detail: "",
          },
          ...s.assetAudit,
        ],
      })),
    addPlanItem: (item) => {
      const id = `pp-${Date.now()}`;
      setState((s) => ({
        ...s,
        planItems: [...s.planItems, { ...item, id }],
        assetAudit: [
          {
            id: `aud-${Date.now()}`,
            at: today(),
            actorId: currentUser.id,
            entity: "beszerzes",
            entityId: id,
            action: "Beszerzési terv tétel létrehozása",
            detail: `${item.planYear} ${item.quarter} · ${item.quantity} db`,
          },
          ...s.assetAudit,
        ],
      }));
      return id;
    },
    updatePlanItem: (id, patch) =>
      setState((s) => ({
        ...s,
        planItems: s.planItems.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        assetAudit: [
          {
            id: `aud-${Date.now()}`,
            at: today(),
            actorId: currentUser.id,
            entity: "beszerzes",
            entityId: id,
            action: "Beszerzési terv tétel módosítása",
            detail: Object.keys(patch).join(", "),
          },
          ...s.assetAudit,
        ],
      })),
    removePlanItem: (id) =>
      setState((s) => ({
        ...s,
        planItems: s.planItems.filter((p) => p.id !== id),
        assetAudit: [
          {
            id: `aud-${Date.now()}`,
            at: today(),
            actorId: currentUser.id,
            entity: "beszerzes",
            entityId: id,
            action: "Beszerzési terv tétel törlése",
            detail: "",
          },
          ...s.assetAudit,
        ],
      })),
    resetDemo: () => {
      window.localStorage.removeItem(STORAGE_KEY);
      setState({ ...initialState, loggedIn: true });
    },
    activeAnnouncements: (state.announcements ?? []).filter(
      (a) =>
        a.active &&
        a.expiresAt >= today() &&
        (a.level === "fontos" || !(state.dismissedAnnouncements ?? []).includes(a.id)),
    ),
    addAnnouncement: (input) => {
      const id = `ann-${Date.now()}`;
      setState((s) => ({
        ...s,
        announcements: [
          { ...input, id, publishedAt: today(), createdBy: s.currentUserId },
          ...s.announcements,
        ],
        assetAudit: [
          {
            id: `aud-${Date.now()}`,
            at: today(),
            actorId: currentUser.id,
            entity: "kozlemeny",
            entityId: id,
            action: "Közlemény közzététele",
            detail: `${input.title} · lejárat: ${input.expiresAt}`,
          },
          ...s.assetAudit,
        ],
      }));
      return id;
    },
    updateAnnouncement: (id, patch) =>
      setState((s) => ({
        ...s,
        announcements: s.announcements.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        assetAudit: [
          {
            id: `aud-${Date.now()}`,
            at: today(),
            actorId: currentUser.id,
            entity: "kozlemeny",
            entityId: id,
            action: "Közlemény módosítása",
            detail: Object.keys(patch).join(", "),
          },
          ...s.assetAudit,
        ],
      })),
    removeAnnouncement: (id) =>
      setState((s) => ({
        ...s,
        announcements: s.announcements.filter((a) => a.id !== id),
        assetAudit: [
          {
            id: `aud-${Date.now()}`,
            at: today(),
            actorId: currentUser.id,
            entity: "kozlemeny",
            entityId: id,
            action: "Közlemény törlése",
            detail: "",
          },
          ...s.assetAudit,
        ],
      })),
    dismissAnnouncement: (id) =>
      setState((s) => ({
        ...s,
        dismissedAnnouncements: s.dismissedAnnouncements.includes(id)
          ? s.dismissedAnnouncements
          : [...s.dismissedAnnouncements, id],
      })),
    setUserRoles: (userId, roles, reason) =>
      setState((s) => {
        const base = USERS.find((u) => u.id === userId);
        if (!base) return s;
        const prev = s.roleOverrides[userId] ?? base.roles;
        const added = roles.filter((r) => !prev.includes(r));
        const removed = prev.filter((r) => !roles.includes(r));
        if (added.length === 0 && removed.length === 0) return s;
        const stamp = Date.now();
        const events: RoleAuditEvent[] = [
          ...added.map((role, i) => ({
            id: `ra-${stamp}-a${i}`,
            at: today(),
            actorId: s.currentUserId,
            targetUserId: userId,
            action: "megadva" as const,
            role,
            reason,
          })),
          ...removed.map((role, i) => ({
            id: `ra-${stamp}-r${i}`,
            at: today(),
            actorId: s.currentUserId,
            targetUserId: userId,
            action: "visszavonva" as const,
            role,
            reason,
          })),
        ];
        return {
          ...s,
          roleOverrides: { ...s.roleOverrides, [userId]: roles },
          roleAudit: [...events, ...s.roleAudit],
        };
      }),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const lookup = {
  user: (id?: string) => USERS.find((u) => u.id === id),
  userName: (id?: string) =>
    id === "u-system" ? "Rendszer" : (USERS.find((u) => u.id === id)?.name ?? "Ismeretlen"),
  unit: (id?: string) => ORG_UNITS.find((o) => o.id === id)?.name ?? "—",
  team: (id?: string) => TEAMS.find((t) => t.id === id)?.name ?? "—",
  catalog: (id?: string) => CATALOG.find((c) => c.id === id),
  domain: (key?: string) => DOMAINS.find((d) => d.key === key),
  project: (id?: string) => PROJECTS.find((p) => p.id === id),
};

export { CATALOG, DOMAINS, ORG_UNITS, PROJECTS, RESPONSIBILITIES, TEAMS, USERS };