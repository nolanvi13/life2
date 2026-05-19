import { fmt, gaugeStatus } from "@/lib/budget";

type Props = {
  reste: number;
  salaire: number;
  label: string;
};

export function BudgetGauge({ reste, salaire, label }: Props) {
  const { label: statusLabel, color, pct } = gaugeStatus(reste, salaire);
  const isNegative = reste < 0;

  return (
    <div className="rounded-3xl p-5" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: `${color}20`, color }}
        >
          {statusLabel}
        </span>
      </div>

      <div
        className="text-3xl font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", color: isNegative ? "#EF4444" : "var(--text)" }}
      >
        {fmt(reste)}
        <span className="text-sm font-normal ml-1" style={{ color: "var(--text-muted)" }}>/mois</span>
      </div>

      <div className="h-1.5 rounded-full overflow-hidden mt-3" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct.toFixed(1)}%`, background: color }}
        />
      </div>
      <p className="text-xs mt-1.5" style={{ color: "var(--text-xmuted)" }}>
        {pct.toFixed(0)}% du salaire net
      </p>
    </div>
  );
}
