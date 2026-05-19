"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>

      {/* Colored top */}
      <div
        className="flex flex-col items-center justify-end px-6 pt-16 pb-10 flex-shrink-0"
        style={{
          background: "var(--pastel-purple)",
          minHeight: "42vh",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
          style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)" }}
        >
          🏠
        </div>
        <h1
          className="text-4xl font-bold text-center"
          style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
        >
          Life2
        </h1>
        <p className="text-sm mt-2 text-center" style={{ color: "var(--text-muted)" }}>
          Votre espace partagé
        </p>
      </div>

      {/* Form card — overlaps */}
      <div
        className="flex-1 flex flex-col px-5 pt-8 pb-8 -mt-6 rounded-t-[32px]"
        style={{ background: "var(--surface)", boxShadow: "0 -4px 24px rgba(107,70,252,0.08)" }}
      >
        <h2
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
        >
          Connexion
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
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
              placeholder="••••••••"
              required
              className="h-12 rounded-2xl text-sm"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            />
          </div>

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
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-semibold" style={{ color: "var(--accent-purple)" }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
