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
  AppNotification,
  Project,
  RequestMessage,
  RoleKey,
  ServiceRequest,
  StatusKey,
  User,
} from "./types";

const STORAGE_KEY = "aok-portal-state-v1";

interface PersistedState {
  requests: ServiceRequest[];
  notifications: AppNotification[];
  currentUserId: string;
  activeRole: RoleKey;
  loggedIn: boolean;
}

const initialState: PersistedState = {
  requests: REQUESTS,
  notifications: NOTIFICATIONS,
  currentUserId: "u-kovacs",
  activeRole: "igenylo",
  loggedIn: false,
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
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as PersistedState) });
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

  const currentUser = useMemo(
    () => USERS.find((u) => u.id === state.currentUserId) ?? USERS[0]!,
    [state.currentUserId],
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
    users: USERS,
    projects: PROJECTS,
    currentUser,
    login: (userId) =>
      setState((s) => {
        const u = USERS.find((x) => x.id === userId) ?? USERS[0]!;
        return { ...s, loggedIn: true, currentUserId: u.id, activeRole: u.roles[0]! };
      }),
    logout: () => setState((s) => ({ ...s, loggedIn: false })),
    setActiveRole: (role) => setState((s) => ({ ...s, activeRole: role })),
    switchUser: (userId) =>
      setState((s) => {
        const u = USERS.find((x) => x.id === userId) ?? USERS[0]!;
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
      patchRequest(id, (r) => ({
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
      })),
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
      patchRequest(id, (r) => {
        const approvals = r.approvals.map((a) =>
          a.id === approvalId ? { ...a, decision, decidedAt: today(), comment } : a,
        );
        const rejected = decision === "elutasitva";
        const allDone = approvals.every((a) => a.decision === "jovahagyva");
        return {
          ...r,
          approvals,
          status: rejected ? "elutasitva" : allDone ? "elfogadva" : r.status,
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
      }),
    markNotificationsRead: () =>
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      })),
    rateRequest: (id, rating) => patchRequest(id, (r) => ({ ...r, rating })),
    resetDemo: () => {
      window.localStorage.removeItem(STORAGE_KEY);
      setState({ ...initialState, loggedIn: true });
    },
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