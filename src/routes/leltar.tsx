import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Cpu, HardDrive, Laptop, MemoryStick, MonitorCog, Package, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { HARDWARE_MODELS, SOFTWARE_SUGGESTIONS, specForModel } from "@/lib/inventory-data";
import { INVENTORY_STATUS_LABELS, type InventoryItem } from "@/lib/types";
import { MyAssets, MyLicences, SharedAssets } from "@/components/personal-assets";

export const Route = createFileRoute("/leltar")({
  head: () => ({
    meta: [
      { title: "Személyi leltár – ÁOK Digitális Szolgáltatási Portál" },
      {
        name: "description",
        content:
          "Személyi használatú hardver- és szoftverleltár feltöltése, automatikus eszközadat-felismeréssel és rendszergazdai jóváhagyással.",
      },
      { property: "og:title", content: "Személyi leltár – ÁOK Digitális Szolgáltatási Portál" },
      {
        property: "og:description",
        content: "Saját eszközök és szoftverek nyilvántartása jóváhagyási folyamattal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Inventory,
});

function statusTone(status: InventoryItem["status"]) {
  if (status === "jovahagyva") return "bg-primary/10 text-primary";
  if (status === "elutasitva") return "bg-destructive/10 text-destructive";
  return "bg-accent text-accent-foreground";
}

export function SpecGrid({ item }: { item: InventoryItem }) {
  if (!item.spec) return null;
  const s = item.spec;
  return (
    <div className="mt-3 rounded-md border border-border bg-secondary/40 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Automatikusan hozzárendelt műszaki adatok
      </p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MonitorCog className="size-3.5" aria-hidden="true" /> Operációs rendszer
          </dt>
          <dd className="text-sm font-medium">{s.os}</dd>
          <dd className="text-xs text-muted-foreground">verzió: {s.osVersion}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Cpu className="size-3.5" aria-hidden="true" /> Processzor
          </dt>
          <dd className="text-sm font-medium">{s.cpu}</dd>
          <dd className="text-xs text-muted-foreground">{s.cpuCores} mag</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MemoryStick className="size-3.5" aria-hidden="true" /> Memória
          </dt>
          <dd className="text-sm font-medium">{s.ram}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HardDrive className="size-3.5" aria-hidden="true" /> Tároló
          </dt>
          <dd className="text-sm font-medium">{s.storage}</dd>
        </div>
      </dl>
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Speciális feature-ök</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {s.features.map((f) => (
            <Badge key={f} variant="secondary" className="font-normal">
              {f}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function Inventory() {
  const { inventory, currentUser, addInventoryItem, removeInventoryItem } = useStore();
  const mine = inventory.filter((i) => i.ownerId === currentUser.id);
  const hardware = mine.filter((i) => i.kind === "hardver");
  const software = mine.filter((i) => i.kind === "szoftver");

  const [hw, setHw] = useState({ name: "", modelKey: "", serial: "", location: "", note: "" });
  const [sw, setSw] = useState({ name: "", version: "", licenseType: "", licenseKey: "", installedOn: "" });

  const preview = hw.modelKey ? specForModel(hw.modelKey) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Személyi leltár</h1>
        <p className="mt-1.5 max-w-3xl text-muted-foreground">
          Itt rögzítheti a személyi használatában lévő hardvereszközöket és szoftvereket. A hardver
          modelljéhez a rendszer automatikusan hozzárendeli az operációs rendszert és annak
          verzióját, a processzor-, memória- és tárolóadatokat, valamint a speciális feature-öket.
          Minden új tétel a rendszeradminisztrátor jóváhagyásával kerül a hivatalos leltárba.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Hardvereszköz", hardware.length, Laptop],
          ["Szoftver", software.length, Package],
          ["Jóváhagyásra vár", mine.filter((i) => i.status === "jovahagyasra_var").length, Sparkles],
        ].map(([label, value, Icon]) => {
          const I = Icon as typeof Laptop;
          return (
            <div key={label as string} className="card-surface flex items-center gap-3 p-4">
              <span className="grid size-9 place-items-center rounded-md bg-secondary">
                <I className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xl font-semibold">{value as number}</span>
                <span className="block text-xs text-muted-foreground">{label as string}</span>
              </span>
            </div>
          );
        })}
      </div>

      <Tabs defaultValue="eszkozeim">
        <TabsList className="flex-wrap">
          <TabsTrigger value="eszkozeim">Rám rendelt eszközök</TabsTrigger>
          <TabsTrigger value="licencek">Szoftverlicenceim</TabsTrigger>
          <TabsTrigger value="kozos">Közös eszközök</TabsTrigger>
          <TabsTrigger value="hardver">Saját bejelentés – hardver</TabsTrigger>
          <TabsTrigger value="szoftver">Saját bejelentés – szoftver</TabsTrigger>
        </TabsList>

        <TabsContent value="eszkozeim">
          <MyAssets />
        </TabsContent>

        <TabsContent value="licencek">
          <MyLicences />
        </TabsContent>

        <TabsContent value="kozos">
          <SharedAssets />
        </TabsContent>

        <TabsContent value="hardver" className="space-y-4">
          <section className="card-surface p-5">
            <h2 className="font-display text-base font-semibold">Új eszköz feltöltése</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="hw-name">Eszköz megnevezése</Label>
                <Input
                  id="hw-name"
                  value={hw.name}
                  onChange={(e) => setHw({ ...hw, name: e.target.value })}
                  placeholder="pl. Oktatói notebook"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hw-model">Eszköztípus / modell</Label>
                <Select value={hw.modelKey} onValueChange={(v) => setHw({ ...hw, modelKey: v })}>
                  <SelectTrigger id="hw-model">
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
                <Label htmlFor="hw-serial">Leltári vagy gyári szám</Label>
                <Input
                  id="hw-serial"
                  value={hw.serial}
                  onChange={(e) => setHw({ ...hw, serial: e.target.value })}
                  placeholder="pl. AOK-NB-2314"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hw-loc">Elhelyezés</Label>
                <Input
                  id="hw-loc"
                  value={hw.location}
                  onChange={(e) => setHw({ ...hw, location: e.target.value })}
                  placeholder="pl. Élettani Intézet, 214. szoba"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="hw-note">Megjegyzés</Label>
                <Textarea
                  id="hw-note"
                  value={hw.note}
                  onChange={(e) => setHw({ ...hw, note: e.target.value })}
                  placeholder="Felhasználás célja, egyéb tudnivaló"
                />
              </div>
            </div>

            {preview && (
              <SpecGrid
                item={{
                  id: "preview",
                  ownerId: currentUser.id,
                  kind: "hardver",
                  name: hw.name,
                  spec: preview,
                  status: "jovahagyasra_var",
                  createdAt: "",
                }}
              />
            )}

            <Button
              className="mt-4"
              disabled={!hw.name.trim() || !hw.modelKey}
              onClick={() => {
                addInventoryItem({
                  kind: "hardver",
                  name: hw.name.trim(),
                  modelKey: hw.modelKey,
                  serial: hw.serial || undefined,
                  location: hw.location || undefined,
                  note: hw.note || undefined,
                });
                setHw({ name: "", modelKey: "", serial: "", location: "", note: "" });
                toast.success("Az eszköz rögzítve, rendszergazdai jóváhagyásra vár.");
              }}
            >
              Eszköz beküldése jóváhagyásra
            </Button>
          </section>

          {hardware.length === 0 ? (
            <p className="text-sm text-muted-foreground">Még nincs rögzített hardvereszköz.</p>
          ) : (
            hardware.map((i) => (
              <article key={i.id} className="card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold">{i.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {HARDWARE_MODELS.find((m) => m.key === i.modelKey)?.label ?? "Egyedi eszköz"}
                      {i.serial ? ` · ${i.serial}` : ""}
                      {i.location ? ` · ${i.location}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(i.status)}`}>
                      {INVENTORY_STATUS_LABELS[i.status]}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Tétel törlése"
                      onClick={() => {
                        removeInventoryItem(i.id);
                        toast.success("Tétel törölve a leltárból.");
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                {i.decisionComment && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Adminisztrátori megjegyzés: {i.decisionComment}
                  </p>
                )}
                <SpecGrid item={i} />
              </article>
            ))
          )}
        </TabsContent>

        <TabsContent value="szoftver" className="space-y-4">
          <section className="card-surface p-5">
            <h2 className="font-display text-base font-semibold">Új szoftver feltöltése</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sw-name">Szoftver neve</Label>
                <Input
                  id="sw-name"
                  list="sw-suggestions"
                  value={sw.name}
                  onChange={(e) => setSw({ ...sw, name: e.target.value })}
                  placeholder="pl. SPSS Statistics"
                />
                <datalist id="sw-suggestions">
                  {SOFTWARE_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sw-version">Verzió</Label>
                <Input
                  id="sw-version"
                  value={sw.version}
                  onChange={(e) => setSw({ ...sw, version: e.target.value })}
                  placeholder="pl. 29.0.2.0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sw-lic">Licenc típusa</Label>
                <Input
                  id="sw-lic"
                  value={sw.licenseType}
                  onChange={(e) => setSw({ ...sw, licenseType: e.target.value })}
                  placeholder="pl. Kari kampuszlicenc"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sw-key">Licenckulcs vagy azonosító</Label>
                <Input
                  id="sw-key"
                  value={sw.licenseKey}
                  onChange={(e) => setSw({ ...sw, licenseKey: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="sw-host">Telepítve az alábbi eszközre</Label>
                <Select value={sw.installedOn} onValueChange={(v) => setSw({ ...sw, installedOn: v })}>
                  <SelectTrigger id="sw-host">
                    <SelectValue placeholder="Válasszon a saját hardverleltárból" />
                  </SelectTrigger>
                  <SelectContent>
                    {hardware.map((h) => (
                      <SelectItem key={h.id} value={h.serial ?? h.name}>
                        {h.name} {h.serial ? `(${h.serial})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="mt-4"
              disabled={!sw.name.trim()}
              onClick={() => {
                addInventoryItem({
                  kind: "szoftver",
                  name: sw.name.trim(),
                  version: sw.version || undefined,
                  licenseType: sw.licenseType || undefined,
                  licenseKey: sw.licenseKey || undefined,
                  installedOn: sw.installedOn || undefined,
                });
                setSw({ name: "", version: "", licenseType: "", licenseKey: "", installedOn: "" });
                toast.success("A szoftver rögzítve, rendszergazdai jóváhagyásra vár.");
              }}
            >
              Szoftver beküldése jóváhagyásra
            </Button>
          </section>

          {software.length === 0 ? (
            <p className="text-sm text-muted-foreground">Még nincs rögzített szoftver.</p>
          ) : (
            software.map((i) => (
              <article key={i.id} className="card-surface flex flex-wrap items-start justify-between gap-3 p-5">
                <div>
                  <h3 className="font-display text-base font-semibold">{i.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {[i.version && `verzió ${i.version}`, i.licenseType, i.installedOn && `eszköz: ${i.installedOn}`]
                      .filter(Boolean)
                      .join(" · ") || "Nincs további adat"}
                  </p>
                  {i.decisionComment && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Adminisztrátori megjegyzés: {i.decisionComment}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(i.status)}`}>
                    {INVENTORY_STATUS_LABELS[i.status]}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Tétel törlése"
                    onClick={() => {
                      removeInventoryItem(i.id);
                      toast.success("Tétel törölve a leltárból.");
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </article>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
