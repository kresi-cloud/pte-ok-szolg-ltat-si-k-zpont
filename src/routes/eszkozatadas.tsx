import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, lookup } from "@/lib/store";
import { HARDWARE_MODELS, isMobileModel, specForModel } from "@/lib/inventory-data";
import { ASSET_LOCATIONS } from "@/lib/asset-data";
import { HANDOVER_STATUS_LABELS, type AssetHandover } from "@/lib/types";
import { PageHeading } from "@/components/page-heading";
import { StatTile } from "@/components/asset-bits";

export const Route = createFileRoute("/eszkozatadas")({
  head: () => ({
    meta: [
      { title: "Eszközátadás – ÁOK Digitális Szolgáltatási Portál" },
      {
        name: "description",
        content:
          "Helyi IT referens munkatere: a beszerzésből beérkezett eszközök telepítése, gyári szám és leltárkód rögzítése, átadás az igénylőnek.",
      },
      { property: "og:title", content: "Eszközátadás – ÁOK Digitális Szolgáltatási Portál" },
      {
        property: "og:description",
        content: "Beérkezett eszközök telepítése és átadás-átvétele egy felületen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HandoverWorkspace,
});

function HandoverCard({ handover, canAct }: { handover: AssetHandover; canAct: boolean }) {
  const store = useStore();
  const [serial, setSerial] = useState(handover.serial ?? "");
  const [inventoryNo, setInventoryNo] = useState(handover.inventoryNo ?? "");
  const [modelKey, setModelKey] = useState(handover.modelKey ?? "");
  const [building, setBuilding] = useState(handover.building ?? "");
  const [room, setRoom] = useState(handover.room ?? "");
  const [note, setNote] = useState(handover.note ?? "");

  const spec = modelKey ? specForModel(modelKey) : undefined;
  const needsLocation = Boolean(modelKey) && !isMobileModel(modelKey);
  const buildings = [...new Set(ASSET_LOCATIONS.map((l) => l.building))];
  const rooms = ASSET_LOCATIONS.filter((l) => l.building === building).map((l) => l.room);
  const done = handover.status === "atadva" || handover.status === "atvetel_igazolva";

  const save = (label: string, extra: Partial<AssetHandover> = {}) => {
    store.updateHandover(
      handover.id,
      {
        serial: serial || undefined,
        inventoryNo: inventoryNo || undefined,
        modelKey: modelKey || undefined,
        building: needsLocation ? building || undefined : undefined,
        room: needsLocation ? room || undefined : undefined,
        note: note || undefined,
        installedOs: spec ? `${spec.os} ${spec.osVersion}` : undefined,
        ...extra,
      },
      label,
    );
  };

  return (
    <article className="card-surface space-y-4 p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">{handover.deviceName}</h3>
          <p className="text-xs text-muted-foreground">
            Átvevő: {lookup.user(handover.recipientId)?.name ?? handover.recipientId} ·{" "}
            {lookup.unit(handover.orgUnitId)}
          </p>
          {handover.requestId && (
            <Link
              to="/igeny/$id"
              params={{ id: handover.requestId }}
              className="mt-1 inline-block text-xs font-medium text-primary underline"
            >
              Forrásigény: {handover.requestId}
            </Link>
          )}
        </div>
        <span className="rounded-sm bg-secondary px-2 py-1 text-xs font-semibold">
          {HANDOVER_STATUS_LABELS[handover.status]}
        </span>
      </header>

      {canAct && !done && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`model-${handover.id}`}>Eszközmodell (műszaki adatok forrása)</Label>
            <Select value={modelKey} onValueChange={setModelKey}>
              <SelectTrigger id={`model-${handover.id}`}>
                <SelectValue placeholder="Válasszon modellt" />
              </SelectTrigger>
              <SelectContent>
                {HARDWARE_MODELS.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`serial-${handover.id}`}>Gyári szám (szériaszám)</Label>
            <Input
              id={`serial-${handover.id}`}
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="pl. 5CD3421XYZ"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`inv-${handover.id}`}>PTE leltárkód</Label>
            <Input
              id={`inv-${handover.id}`}
              value={inventoryNo}
              onChange={(e) => setInventoryNo(e.target.value)}
              placeholder="pl. PTE-AOK-IT-004999"
            />
          </div>
          {needsLocation && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor={`bld-${handover.id}`}>Épület</Label>
                <Select value={building} onValueChange={setBuilding}>
                  <SelectTrigger id={`bld-${handover.id}`}>
                    <SelectValue placeholder="Épület" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`room-${handover.id}`}>Helyiség</Label>
                <Select value={room} onValueChange={setRoom}>
                  <SelectTrigger id={`room-${handover.id}`}>
                    <SelectValue placeholder="Helyiség" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`note-${handover.id}`}>Telepítési megjegyzés</Label>
            <Textarea
              id={`note-${handover.id}`}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Telepített szoftverek, beállítások, hálózati csatlakozás…"
            />
          </div>
        </div>
      )}

      {spec && (
        <p className="text-xs text-muted-foreground">
          Telepített rendszer: {spec.os} {spec.osVersion} · {spec.cpu} · {spec.ram}
        </p>
      )}

      {(handover.serial || handover.inventoryNo) && (
        <p className="text-xs text-muted-foreground">
          {handover.serial ? `Gyári szám: ${handover.serial}` : ""}
          {handover.serial && handover.inventoryNo ? " · " : ""}
          {handover.inventoryNo ? `Leltárkód: ${handover.inventoryNo}` : ""}
        </p>
      )}

      <ul className="space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
        {handover.history.map((h, i) => (
          <li key={i}>
            {h.at} · {lookup.user(h.actorId)?.name ?? "—"} – {h.action}
            {h.comment ? ` – ${h.comment}` : ""}
          </li>
        ))}
      </ul>

      {canAct && !done && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              save("Telepítés és beállítás megkezdve", { status: "elokeszites_alatt" });
              toast.success("Telepítés megkezdve");
            }}
          >
            Telepítés megkezdése
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              save("Eszköz átadásra kész", { status: "atadasra_kesz" });
              toast.success("Átadásra kész");
            }}
          >
            Átadásra kész
          </Button>
          <Button
            size="sm"
            disabled={!serial || !inventoryNo || !modelKey}
            onClick={() => {
              save("Átadási adatok rögzítve");
              store.handOverToUser(handover.id, note || undefined);
              toast.success("Eszköz átadva az igénylőnek");
            }}
          >
            Átadás az igénylőnek
          </Button>
          {(!serial || !inventoryNo || !modelKey) && (
            <span className="self-center text-xs text-muted-foreground">
              Az átadáshoz modell, gyári szám és leltárkód szükséges.
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function HandoverWorkspace() {
  const store = useStore();
  const role = store.activeRole;
  const allowed = ["it_referens", "eszkozmenedzser", "beszerzo", "dekan", "admin", "superuser"].includes(
    role,
  );
  const canAct = role === "it_referens";

  const handovers = store.handovers ?? [];
  const mine = useMemo(
    () =>
      canAct
        ? handovers.filter(
            (h) => !h.referentId || h.referentId === store.currentUser.id || h.orgUnitId === store.currentUser.orgUnitId,
          )
        : handovers,
    [handovers, canAct, store.currentUser],
  );
  const open = mine.filter((h) => h.status !== "atvetel_igazolva");
  const closed = mine.filter((h) => h.status === "atvetel_igazolva");

  if (!allowed) {
    return (
      <div className="card-surface mx-auto max-w-2xl space-y-3 p-6">
        <h1 className="font-display text-xl font-semibold">Eszközátadás</h1>
        <p className="text-sm text-muted-foreground">
          Ez a felület a helyi IT referens munkatere. Az Ön átvételre váró eszközeit a Személyi
          leltár oldalon találja.
        </p>
        <Button asChild variant="outline">
          <Link to="/leltar">Személyi leltár</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeading
        title="Eszközátadás"
        description="A beszerzésből beérkezett eszközök telepítése és beállítása, a gyári szám és a PTE leltárkód rögzítése, majd átadás az igénylőnek. Az igénylő átvételi visszaigazolása után az eszköz automatikusan bekerül a személyi leltárába."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Átadásra váró eszköz" value={String(open.length)} />
        <StatTile
          label="Átadva, visszaigazolásra vár"
          value={String(mine.filter((h) => h.status === "atadva").length)}
        />
        <StatTile label="Lezárt átadás" value={String(closed.length)} />
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Folyamatban lévő átadások</h2>
        {open.length === 0 ? (
          <p className="card-surface p-6 text-sm text-muted-foreground">
            Jelenleg nincs beérkezett, átadásra váró eszköz.
          </p>
        ) : (
          open.map((h) => <HandoverCard key={h.id} handover={h} canAct={canAct} />)
        )}
      </section>

      {closed.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Lezárt átadások</h2>
          {closed.map((h) => (
            <HandoverCard key={h.id} handover={h} canAct={false} />
          ))}
        </section>
      )}
    </div>
  );
}
