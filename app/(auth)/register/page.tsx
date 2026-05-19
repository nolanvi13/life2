"use client";

import { useState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"create" | "join">("create");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await register(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>

      {/* Colored top */}
      <div
        className="flex flex-col items-center justify-end px-6 pt-14 pb-8 flex-shrink-0"
        style={{
          background: mode === "create" ? "var(--pastel-purple)" : "var(--pastel-green)",
          transition: "background 300ms ease",
          minHeight: "36vh",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
          style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}
        >
          🏠
        </div>
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
        >
          Life2
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          {mode === "create" ? "Crée votre espace" : "Rejoins ton couple"}
        </p>
      </div>

      {/* Form card */}
      <div
        className="flex-1 flex flex-col px-5 pt-6 pb-8 -mt-6 rounded-t-[32px]"
        style={{ background: "var(--surface)", boxShadow: "0 -4px 24px rgba(107,70,252,0.08)" }}
      >
        {/* Mode toggle */}
        <div
          className="flex rounded-2xl p-1 mb-6"
          style={{ background: "var(--surface-2)" }}
        >
          {(["create", "join"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200"
              style={{
                fontFamily: "var(--font-display)",
                background: mode === m ? "var(--surface)" : "transparent",
                color: mode === m ? "var(--accent-purple)" : "var(--text-muted)",
                boxShadow: mode === m ? "var(--shadow-sm)" : "none",
              }}
            >
              {m === "create" ? "Créer un couple" : "Rejoindre"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          <div className="space-y-1.5">
            <Label htmlFor="display_name" style={{ color: "var(--text-2)", fontSize: "13px", fontWeight: 600 }}>
              Ton prénom
            </Label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              placeholder="Nolan"
              required
              className="h-12 rounded-2xl text-sm"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" style={{ color: "var(--text-2)", fontSize: "13px", fontWeight: 600 }}>
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="toi@example.com"
              required
              className="h-12 rounded-2xl text-sm"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" style={{ color: "var(--text-2)", fontSize: "13px", fontWeight: 600 }}>
              Mot de passe
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="8 caractères minimum"
              minLength={8}
              required
              className="h-12 rounded-2xl text-sm"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            />
          </div>

          {mode === "join" && (
            <div className="space-y-1.5">
              <Label htmlFor="invite_code" style={{ color: "var(--text-2)", fontSize: "13px", fontWeight: 600 }}>
                Code d&apos;invitation
              </Label>
              <Input
                id="invite_code"
                name="invite_code"
                type="text"
                placeholder="ex: A1B2C3D4"
                required
                className="h-12 rounded-2xl text-sm font-mono tracking-widest text-center uppercase"
                style={{ borderColor: "var(--border)", background: "var(--bg)" }}
              />
              <p className="text-xs" style={{ color: "var(--text-xmuted)" }}>
                Demande le code à ton·ta partenaire
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm rounded-2xl px-4 py-3" style={{ background: "#FEE2E2", color: "#B91C1C" }}>
              {error}
            </p>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl font-semibold text-sm"
              style={{ background: "var(--accent-purple)", color: "#fff" }}
            >
              {loading ? "Création…" : mode === "create" ? "Créer mon compte" : "Rejoindre"}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--accent-purple)" }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
