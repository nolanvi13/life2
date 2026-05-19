"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  value: number;
  onChange: (val: number) => void;
  accentColor: string;
};

export function BudgetField({ label, value, onChange, accentColor }: Props) {
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
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-xmuted)" }}>
        {label}
      </span>
      <div
        className="flex items-center gap-2 h-11 px-3 rounded-2xl transition-all duration-150"
        style={{
          background: "var(--bg)",
          border: `1.5px solid ${focused ? accentColor : "var(--border)"}`,
          boxShadow: focused ? `0 0 0 3px ${accentColor}18` : "none",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-xs font-bold flex-shrink-0" style={{ color: "var(--text-xmuted)" }}>CHF</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="0"
          className="flex-1 bg-transparent outline-none text-sm font-semibold text-right"
          style={{ color: "var(--text)", fontFamily: "var(--font-body)" }}
        />
      </div>
    </div>
  );
}
