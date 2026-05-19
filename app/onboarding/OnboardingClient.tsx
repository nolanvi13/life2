"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OnboardingClient({
  inviteCode,
  displayName,
}: {
  inviteCode: string;
  displayName: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
        >
          Bienvenue, {displayName} !
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          Ton couple est créé. Partage ce code à ton·ta partenaire pour qu'il·elle rejoigne l'app.
        </p>

        {/* Code card */}
        <div
          className="rounded-3xl p-6 mb-6"
          style={{
            background: "var(--surface)",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Ton code d'invitation
          </p>
          <div
            className="rounded-2xl px-6 py-4 mb-4 font-mono text-3xl font-bold tracking-widest cursor-pointer select-all"
            style={{
              background: "var(--pastel-purple)",
              color: "var(--accent-purple)",
              letterSpacing: "0.2em",
            }}
            onClick={copyCode}
          >
            {inviteCode.toUpperCase()}
          </div>
          <button
            onClick={copyCode}
            className="text-sm font-medium transition-colors"
            style={{ color: copied ? "var(--accent-green)" : "var(--accent-purple)" }}
          >
            {copied ? "✓ Copié !" : "Copier le code"}
          </button>
        </div>

        <Button
          onClick={() => router.push("/dashboard")}
          className="w-full rounded-xl font-medium"
          style={{ background: "var(--accent-purple)", color: "#fff" }}
        >
          Continuer vers l'app →
        </Button>

        <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
          Tu pourras retrouver ce code dans les réglages
        </p>
      </div>
    </div>
  );
}
