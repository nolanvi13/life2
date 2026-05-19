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
    <div
      style={{
        background: "#fff",
        border: "0.5px solid var(--color-border)",
        borderRadius: "14px",
        padding: "20px 22px",
        marginBottom: "14px",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            color: "var(--color-muted)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            padding: "3px 10px",
            borderRadius: "20px",
            background: `${color}20`,
            color,
            fontFamily: "var(--font-body)",
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "30px",
          fontWeight: 500,
          color: isNegative ? "#C4614A" : "var(--color-ink)",
          marginBottom: "4px",
          letterSpacing: "-0.5px",
        }}
      >
        {fmt(reste)}
        <span style={{ fontSize: "14px", fontWeight: 400, marginLeft: "6px", color: "var(--color-muted)", fontFamily: "var(--font-body)" }}>
          /mois
        </span>
      </div>

      <div style={{ height: "6px", borderRadius: "3px", overflow: "hidden", background: "var(--color-border)", marginTop: "12px" }}>
        <div
          style={{
            width: `${pct.toFixed(1)}%`,
            height: "100%",
            borderRadius: "3px",
            background: color,
            transition: "width 0.5s",
          }}
        />
      </div>
      <p style={{ fontSize: "12px", marginTop: "6px", color: "var(--text-xmuted)", fontFamily: "var(--font-body)" }}>
        {pct.toFixed(0)}% du salaire net
      </p>
    </div>
  );
}
