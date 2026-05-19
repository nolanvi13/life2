"use client";

import { useState } from "react";
import { updateDisplayName, createCouple, joinCouple } from "@/app/actions/profile";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function InitialsAvatar({ name, color, bg }: { name: string; color: string; bg: string }) {
  return (
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
      style={{ background: bg, color, fontFamily: "var(--font-display)" }}
    >
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-5 mb-3"
      style={{ background: "var(--surface)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)" }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-bold mb-4 text-base" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
      {children}
    </h2>
  );
}

export default function SettingsClient({
  email,
  displayName,
  inviteCode: initialInviteCode,
}: {
  email: string;
  displayName: string;
  inviteCode: string | null;
}) {
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [copied, setCopied] = useState(false);

  const [coupleMode, setCoupleMode] = useState<"join" | null>(null);
  const [coupleLoading, setCoupleLoading] = useState(false);
  const [coupleError, setCoupleError] = useState<string | null>(null);

  // Guess user color from name (simple heuristic)
  const isLylou = name.toLowerCase().startsWith("l");
  const avatarBg = isLylou ? "var(--pastel-pink)" : "var(--pastel-yellow)";
  const avatarColor = isLylou ? "#9B1A5A" : "#7A5800";

  async function handleSaveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setNameError(null);
    const result = await updateDisplayName(new FormData(e.currentTarget));
    if (result?.error) setNameError(result.error);
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  }

  async function handleCreateCouple() {
    setCoupleLoading(true);
    setCoupleError(null);
    const result = await createCouple();
    if (result?.error) setCoupleError(result.error);
    else if (result.inviteCode) setInviteCode(result.inviteCode);
    setCoupleLoading(false);
  }

  async function handleJoinCouple(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCoupleLoading(true);
    setCoupleError(null);
    const result = await joinCouple(new FormData(e.currentTarget));
    if (result?.error) setCoupleError(result.error);
    else setCoupleMode(null);
    setCoupleLoading(false);
  }

  function copyCode() {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-32 md:pb-8">

      {/* Personal header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-up">
        <InitialsAvatar name={name || "?"} color={avatarColor} bg={avatarBg} />
        <div>
          <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>
            {name || "Mon compte"}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{email}</p>
        </div>
      </div>

      {/* Profil */}
      <Section>
        <SectionTitle>Mon profil</SectionTitle>
        <form onSubmit={handleSaveName} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display_name" style={{ color: "var(--text-2)", fontSize: "13px", fontWeight: 600 }}>
              Prénom affiché
            </Label>
            <Input
              id="display_name"
              name="display_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-2xl text-sm"
              style={{ borderColor: "var(--border)", background: "var(--bg)" }}
            />
          </div>
          {nameError && <p className="text-sm" style={{ color: "#B91C1C" }}>{nameError}</p>}
          <Button
            type="submit"
            disabled={saving}
            className="h-10 rounded-2xl text-sm font-semibold"
            style={{ background: "var(--accent-purple)", color: "#fff" }}
          >
            {saving ? "Sauvegarde…" : saved ? "✓ Sauvegardé" : "Sauvegarder"}
          </Button>
        </form>
      </Section>

      {/* Couple */}
      <Section>
        <SectionTitle>Mon couple</SectionTitle>

        {inviteCode ? (
          <>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              Partage ce code à ton·ta partenaire pour rejoindre l&apos;app
            </p>
            <div className="flex items-center gap-3">
              <div
                className="flex-1 rounded-2xl px-4 py-3 font-mono text-xl font-bold tracking-[0.2em] text-center cursor-pointer select-all"
                style={{ background: "var(--pastel-purple)", color: "var(--accent-purple)" }}
                onClick={copyCode}
              >
                {inviteCode.toUpperCase()}
              </div>
              <button
                onClick={copyCode}
                className="h-12 px-4 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: copied ? "var(--pastel-green)" : "var(--surface-2)",
                  color: copied ? "var(--accent-green)" : "var(--accent-purple)",
                  border: "1px solid var(--border)",
                }}
              >
                {copied ? "✓" : "Copier"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              Tu n&apos;es dans aucun couple pour l&apos;instant
            </p>

            {coupleMode === null && (
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateCouple}
                  disabled={coupleLoading}
                  className="flex-1 h-11 rounded-2xl text-sm font-semibold"
                  style={{ background: "var(--accent-purple)", color: "#fff" }}
                >
                  {coupleLoading ? "Création…" : "Créer un couple"}
                </Button>
                <Button
                  onClick={() => setCoupleMode("join")}
                  variant="outline"
                  className="flex-1 h-11 rounded-2xl text-sm font-semibold"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  Rejoindre
                </Button>
              </div>
            )}

            {coupleMode === "join" && (
              <form onSubmit={handleJoinCouple} className="space-y-3">
                <Input
                  name="invite_code"
                  placeholder="Code d'invitation"
                  required
                  className="h-11 rounded-2xl text-sm font-mono tracking-widest text-center uppercase"
                  style={{ borderColor: "var(--border)", background: "var(--bg)" }}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={coupleLoading}
                    className="flex-1 h-11 rounded-2xl text-sm font-semibold"
                    style={{ background: "var(--accent-purple)", color: "#fff" }}
                  >
                    {coupleLoading ? "Vérification…" : "Rejoindre"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCoupleMode(null)}
                    className="h-11 rounded-2xl text-sm"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}

            {coupleError && <p className="text-sm mt-2" style={{ color: "#B91C1C" }}>{coupleError}</p>}
          </>
        )}
      </Section>

      {/* Déconnexion */}
      <Section>
        <SectionTitle>Compte</SectionTitle>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Tu seras redirigé vers la page de connexion
        </p>
        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            className="h-11 rounded-2xl text-sm font-semibold"
            style={{ borderColor: "#FCA5A5", color: "#DC2626", background: "transparent" }}
          >
            Se déconnecter
          </Button>
        </form>
      </Section>
    </div>
  );
}
