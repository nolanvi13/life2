"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  value: number;
  onChange: (val: number) => void;
};

export function BudgetField({ label, value, onChange }: Props) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFocus() {
    setFocused(true);
    setRaw(value === 0 ? "" : String(value));
  }

  function handleBlur() {
    setFocused(false);
    const parsed = raw === "" ? 0 : parseInt(raw.replace(/\D/g, ""), 10) || 0;
    setRaw("");
    if (parsed !== value) onChange(parsed);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setRaw(digits);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const parsed = digits === "" ? 0 : parseInt(digits, 10) || 0;
      onChange(parsed);
    }, 600);
  }

  useEffect(() => () => { if (debounce.current) clearTimeout(debounce.current); }, []);

  const displayValue = focused
    ? raw
    : value === 0 ? "" : new Intl.NumberFormat("fr-CH").format(value);

  return (
    <div style={{ marginBottom: "8px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: `0.5px solid ${focused ? "var(--color-forest)" : "var(--color-border)"}`,
          borderRadius: "10px",
          padding: "10px 14px",
          transition: "border-color 0.15s",
          background: "#fff",
          cursor: "text",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <span
          style={{
            fontSize: "13px",
            color: "var(--color-muted)",
            marginRight: "10px",
            fontFamily: "var(--font-body)",
            flexShrink: 0,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "13px",
            color: "var(--color-muted)",
            marginRight: "6px",
            fontFamily: "var(--font-body)",
            flexShrink: 0,
            marginLeft: "auto",
          }}
        >
          CHF
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="0"
          style={{
            border: "none",
            background: "transparent",
            fontFamily: "var(--font-display)",
            fontSize: "16px",
            color: "var(--color-ink)",
            textAlign: "right",
            width: "90px",
            outline: "none",
            fontWeight: 500,
          }}
        />
      </div>
    </div>
  );
}
