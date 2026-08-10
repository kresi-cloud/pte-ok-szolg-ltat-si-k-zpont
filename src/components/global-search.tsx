import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CATALOG, ORG_UNITS, PROJECTS, useStore } from "@/lib/store";
import { STATUS_LABELS } from "@/lib/types";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { requests } = useStore();
  const navigate = useNavigate();

  const go = (to: string, params?: Record<string, string>) => {
    onOpenChange(false);
    navigate({ to: to as "/", params: params as never });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Keresés szolgáltatások, igények és projektek között…" />
      <CommandList>
        <CommandEmpty>Nincs találat.</CommandEmpty>
        <CommandGroup heading="Igények">
          {requests.slice(0, 40).map((r) => (
            <CommandItem
              key={r.id}
              value={`${r.id} ${r.title}`}
              onSelect={() => go("/igeny/$id", { id: r.id })}
            >
              <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
              <span className="truncate">{r.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {STATUS_LABELS[r.status]}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Fejlesztési kezdeményezések">
          {PROJECTS.map((p) => (
            <CommandItem key={p.id} value={p.name} onSelect={() => go("/portfolio")}>
              {p.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Szolgáltatások">
          {CATALOG.map((c) => (
            <CommandItem key={c.id} value={c.name} onSelect={() => go("/szolgaltatasok")}>
              {c.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Szervezeti egységek">
          {ORG_UNITS.map((o) => (
            <CommandItem key={o.id} value={o.name} onSelect={() => go("/felelossegek")}>
              {o.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Dokumentáció">
          <CommandItem value="segítség súgó folyamat" onSelect={() => go("/segitseg")}>
            Segítség és folyamatleírás
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}