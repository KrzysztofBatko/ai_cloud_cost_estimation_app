const PROVIDERS = ["AWS", "Azure", "GCP", "Vercel", "Oracle"] as const;
type Provider = (typeof PROVIDERS)[number];

export const PROVIDER_HEX: Record<Provider, string> = {
  AWS: "#CF820E",
  Azure: "#5899C4",
  GCP: "#30A661",
  Vercel: "#8684BF",
  Oracle: "#F80000",
};

export const DEFAULT_COLOR = "#7C94A6";

export function ProviderDot({ provider }: { provider: string }) {
  const color = PROVIDER_HEX[provider as Provider] ?? DEFAULT_COLOR;

  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
      style={{
        background: color,
        border: "0.1px solid rgba(0, 0, 0, 0.18)",
        boxShadow:
          "inset 0 1px 1px rgba(255, 255, 255, 0.55), inset 0 -1px 2px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.35)",
      }}
    />
  );
}

export default function Legend({ providers }: { providers: string[] }) {
  return (
    <div className="flex items-center gap-4">
      {providers.map((p) => (
        <div key={p} className="flex items-center gap-1.5">
          <ProviderDot provider={p} />
          <span className="text-xs text-muted-foreground">{p}</span>
        </div>
      ))}
    </div>
  );
}
