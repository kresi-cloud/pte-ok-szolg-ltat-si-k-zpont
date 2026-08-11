import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATALOG, ORG_UNITS, TEAMS, USERS, lookup, useStore } from "@/lib/store";
import { INVENTORY_STATUS_LABELS, ROLE_LABELS } from "@/lib/types";
import { HARDWARE_MODELS } from "@/lib/inventory-data";
import { SpecGrid } from "@/routes/leltar";

export const Route = createFileRoute("/adminisztracio")({
  head: () => ({
    meta: [
      { title: "Adminisztráció – ÁOK Digitális Szolgáltatási Portál" },
      {
        name: "description",
        content: "Felhasználók, szerepkörök, szervezeti egységek, katalógus és AI-beállítások kezelése.",
      },
      { property: "og:title", content: "Adminisztráció – ÁOK Digitális Szolgáltatási Portál" },
      { property: "og:description", content: "Portálbeállítások rendszergazdák számára." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { resetDemo, inventory, decideInventoryItem } = useStore();
  const [comments, setComments] = useState<Record<string, string>>({});
  const pending = inventory.filter((i) => i.status === "jovahagyasra_var");
  const decided = inventory.filter((i) => i.status !== "jovahagyasra_var");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Adminisztráció</h1>
        <p className="mt-1.5 text-muted-foreground">
          Törzsadatok és a portál működését szabályozó beállítások.
        </p>
      </div>

      <Tabs defaultValue="felhasznalok">
        <TabsList className="flex-wrap">
          <TabsTrigger value="felhasznalok">Felhasználók</TabsTrigger>
          <TabsTrigger value="egysegek">Szervezeti egységek</TabsTrigger>
          <TabsTrigger value="katalogus">Katalógus</TabsTrigger>
          <TabsTrigger value="leltar">
            Leltár jóváhagyás{pending.length > 0 ? ` (${pending.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="ai">AI-beállítások</TabsTrigger>
        </TabsList>

        <TabsContent value="felhasznalok">
          <div className="card-surface overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Név</TableHead>
                  <TableHead>Munkakör</TableHead>
                  <TableHead>Egység</TableHead>
                  <TableHead>Szerepkörök</TableHead>
                  <TableHead>Csapat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {USERS.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.title}</TableCell>
                    <TableCell>{lookup.unit(u.orgUnitId)}</TableCell>
                    <TableCell>{u.roles.map((r) => ROLE_LABELS[r]).join(", ")}</TableCell>
                    <TableCell>{u.teamId ? lookup.team(u.teamId) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="egysegek">
          <div className="card-surface overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Szervezeti egység</TableHead>
                  <TableHead>Típus</TableHead>
                  <TableHead>Jóváhagyó</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORG_UNITS.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell className="text-muted-foreground">{o.type}</TableCell>
                    <TableCell>{lookup.userName(o.approverUserId)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="card-surface mt-4 p-5">
            <h2 className="font-display text-base font-semibold">Szolgáltatási csapatok</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {TEAMS.map((t) => (
                <li key={t.id} className="flex flex-wrap justify-between gap-2 border-b border-border pb-2">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">
                    gazda: {lookup.userName(t.ownerUserId)} · {t.members.length} tag
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="katalogus">
          <div className="card-surface overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Szolgáltatás</TableHead>
                  <TableHead>Terület</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Jóváhagyási út</TableHead>
                  <TableHead>Aktív</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CATALOG.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{lookup.domain(c.domain)?.name}</TableCell>
                    <TableCell>{c.sla}</TableCell>
                    <TableCell className="text-muted-foreground">{c.approvals.join(" → ")}</TableCell>
                    <TableCell>
                      <Switch defaultChecked aria-label={`${c.name} aktív`} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <section className="card-surface space-y-5 p-5">
            {/* AI beállítások */}
            <h2 className="font-display text-base font-semibold">AI-támogatás beállításai</h2>
            <p className="text-sm text-muted-foreground">
              Az AI kizárólag javaslatot tesz; minden döntést munkatárs hoz meg, és minden javaslat
              naplózásra kerül.
            </p>
            {[
              ["ai1", "Igényleírás pontosítása az igénylőnél"],
              ["ai2", "Automatikus besorolási javaslat"],
              ["ai3", "Duplikációfigyelés"],
              ["ai4", "Vezetői összefoglalók generálása"],
              ["ai5", "Automatikus döntéshozatal (nem javasolt)"],
            ].map(([id, label], i) => (
              <div key={id} className="flex items-center justify-between gap-4">
                <Label htmlFor={id} className="font-normal">
                  {label}
                </Label>
                <Switch id={id} defaultChecked={i < 4} />
              </div>
            ))}
          </section>

          <section className="card-surface mt-4 p-5">
            <h2 className="font-display text-base font-semibold">Demóadatok</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A prototípus adatai a böngészőben tárolódnak. Visszaállítás után az eredeti mintaadatok
              töltődnek be.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                resetDemo();
                toast.success("A demóadatok visszaállítva.");
              }}
            >
              Demóadatok visszaállítása
            </Button>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}