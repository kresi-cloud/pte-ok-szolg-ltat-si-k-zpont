import { TriangleAlert } from "lucide-react";
import { ASSET_MODELS } from "@/lib/asset-data";
import type { SimilarAsset } from "@/lib/similar-assets";

interface Props {
  items: SimilarAsset[];
  /** kinek szól a szöveg: az igénylőnek saját magáról, vagy a jóváhagyónak az igénylőről */
  audience: "igenylo" | "jovahagyo";
  requesterName?: string | undefined;
}

const CONDITION_LABELS: Record<string, string> = {
  kifogastalan: "Kifogástalan",
  jo: "Jó",
  kopott: "Kopott",
  hibas: "Hibás",
};

export function SimilarAssetNotice({ items, audience, requesterName }: Props) {
  if (items.length === 0) return null;

  const title =
    audience === "igenylo"
      ? "Ön jelenleg is rendelkezik ilyen típusú eszközzel"
      : `${requesterName ? requesterName + " " : "Az igénylő "}jelenleg is rendelkezik ilyen típusú eszközzel`;

  return (
    <div className="flex gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3.5">
      <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {items.map(({ asset, relation }) => {
            const model = ASSET_MODELS.find((m) => m.key === asset.modelKey);
            const name = model ? `${model.manufacturer} ${model.model}` : asset.deviceId;
            return (
              <li key={asset.id}>
                <span className="font-medium">{name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {asset.inventoryNo} · üzembe helyezve: {asset.commissionDate} · állapot:{" "}
                  {CONDITION_LABELS[asset.condition] ?? asset.condition} ·{" "}
                  {relation === "hasznalo" ? "személyes használatban" : "felelősként kezeli"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          A tájékoztatás nem akadályozza az igénylést, de érdemes mérlegelni a meglévő eszköz
          további használatát vagy cseréjét.
        </p>
      </div>
    </div>
  );
}
