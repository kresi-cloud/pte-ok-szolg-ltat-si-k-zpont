import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldCheck, History, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { lookup, useStore } from "@/lib/store";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type RoleKey } from "@/lib/types";
import { PageHeading } from "@/components/page-heading";

export const Route = createFileRoute("/jogosultsagok")({
  head: () => ({
    meta: [
      { title: "Jogosultságkezelés – ÁOK Digitális Szolgáltatási Portál" },
      {
        name: "description",
        content:
          "Superuser felület a felhasználói szerepkörök kiosztására, visszavonására és a jogosultsági napló áttekintésére.",
      },
      { property: "og:title", content: "Jogosultságkezelés – ÁOK Portál" },
      {
        property: "og:description",
        content: "Szerepkörök kiosztása és naplózása superuser jogkörrel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Permissions,
});

const ALL_ROLES: RoleKey[] = [
  "igenylo",
  "jovahagyo",
  "ugyintezo",
  "szolgaltatasgazda",
  "vezeto",
  "dekan",
  "admin",
  "superuser",
];

function Permissions() {
  const store = useStore();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(store.users[0]!.id);
  const [draft, setDraft] = useState<RoleKey[] | null>(null);
  const [reason, setReason] = useState("");

  const superuser = store.activeRole === "superuser";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return store.users;
    return store.users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        lookup.unit(u.orgUnitId).toLowerCase().includes(q),
    );
  }, [query, store.users]);

  const selected = store.users.find((u) => u.id === selectedId) ?? store.users[0]!;
  const roles = draft ?? selected.roles;
  const dirty =
    draft !== null &&
    (draft.length !== selected.roles.length || draft.some((r) => !selected.roles.includes(r)));

  function toggle(role: RoleKey, on: boolean) {
    const next = on ? [...roles, role] : roles.filter((r) => r !== role);
    setDraft(next);
  }

  function save() {
    if (!dirty || reason.trim().length < 5) return;
    store.setUserRoles(selected.id, roles, reason.trim());
    setDraft(null);
    setReason("");
  }

  if (!superuser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <div className="rounded-md border border-border bg-card p-8 text-center">
          <Lock className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Korlátozott felület</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A felhasználói jogosultságok kiosztása kizárólag <strong>superuser</strong> jogkörrel
            végezhető. A rendszeradminisztrátor a szolgáltatási beállításokat kezeli, de
            szerepkört nem oszthat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <PageHeading
            title="Jogosultságkezelés"
            titleClassName="font-display text-3xl font-semibold"
            description="A szerepköröket a kar superuser jogosultságkezelője osztja ki. Minden módosítás indoklással, naplózva történik."
          />
        </div>
        <Badge className="gap-1.5">
          <ShieldCheck className="size-3.5" aria-hidden="true" /> Superuser jogkör aktív
        </Badge>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-md border border-border bg-card">
          <div className="border-b border-border p-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Keresés név, e-mail vagy szervezeti egység szerint…"
              aria-label="Felhasználó keresése"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Felhasználó</TableHead>
                <TableHead>Szervezeti egység</TableHead>
                <TableHead>Szerepkörök</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} data-state={u.id === selected.id ? "selected" : undefined}>
                  <TableCell>
                    <span className="block font-medium">{u.name}</span>
                    <span className="block text-xs text-muted-foreground">{u.email}</span>
                  </TableCell>
                  <TableCell className="text-sm">{lookup.unit(u.orgUnitId)}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <Badge key={r} variant="secondary">
                          {ROLE_LABELS[r]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedId(u.id);
                        setDraft(null);
                        setReason("");
                      }}
                    >
                      Kezelés
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <aside className="space-y-6">
          <div className="rounded-md border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">{selected.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selected.title} · {lookup.unit(selected.orgUnitId)}
            </p>

            <ul className="mt-5 space-y-3">
              {ALL_ROLES.map((r) => (
                <li key={r} className="flex gap-3">
                  <Checkbox
                    id={`role-${r}`}
                    checked={roles.includes(r)}
                    onCheckedChange={(v) => toggle(r, v === true)}
                  />
                  <label htmlFor={`role-${r}`} className="cursor-pointer">
                    <span className="block text-sm font-medium">{ROLE_LABELS[r]}</span>
                    <span className="block text-xs text-muted-foreground">
                      {ROLE_DESCRIPTIONS[r]}
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <label htmlFor="reason" className="mt-5 block text-sm font-medium">
              Módosítás indoklása
            </label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Pl. munkakörváltás, dékáni utasítás száma…"
              className="mt-1.5"
            />
            <div className="mt-4 flex gap-2">
              <Button onClick={save} disabled={!dirty || reason.trim().length < 5}>
                Jogosultság mentése
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setDraft(null);
                  setReason("");
                }}
                disabled={!dirty}
              >
                Elvetés
              </Button>
            </div>
            {dirty && reason.trim().length < 5 && (
              <p className="mt-2 text-xs text-muted-foreground">
                A mentéshez rövid indoklás szükséges.
              </p>
            )}
          </div>

          <div className="rounded-md border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <History className="size-4" aria-hidden="true" /> Jogosultsági napló
            </h2>
            {store.roleAudit.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Még nem történt jogosultság-módosítás ebben a munkamenetben.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {store.roleAudit.slice(0, 20).map((e) => (
                  <li key={e.id} className="border-l-2 border-accent pl-3 text-sm">
                    <span className="block">
                      <strong>{ROLE_LABELS[e.role]}</strong> {e.action} –{" "}
                      {lookup.userName(e.targetUserId)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {e.at} · {lookup.userName(e.actorId)} · {e.reason}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
