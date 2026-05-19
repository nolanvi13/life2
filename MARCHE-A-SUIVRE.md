# 🚀 Marche à suivre — Life2

Guide étape par étape pour toi. Dans l'ordre, sans sauter d'étapes.

---

## Étape 1 — Supabase (15 min)

1. Va sur [supabase.com](https://supabase.com) → créer un compte → **New Project**
2. Donne-lui un nom (`life2`), choisis la région **EU West** (Frankfurt)
3. Note le **mot de passe** de la DB quelque part
4. Une fois le projet créé → **SQL Editor** → colle tout le contenu de `SUPABASE.md` → **Run**
5. Va dans **Database → Replication** → active Realtime pour : `budget_entries`, `items_courses`, `evenements`
6. Va dans **Project Settings → API** → copie :
   - `Project URL`
   - `anon public key`
   - `service_role key` (⚠️ garde ça secret)

---

## Étape 2 — Init du projet Next.js (10 min)

Dans ton terminal :

```bash
npx create-next-app@latest life2 --typescript --tailwind --app --src-dir=false
cd life2
```

Installe les dépendances :

```bash
npm install @supabase/ssr @supabase/supabase-js
npm install next-pwa
npx shadcn@latest init
npx shadcn@latest add button card input label tabs badge dialog
```

---

## Étape 3 — Variables d'environnement (2 min)

Crée un fichier `.env.local` à la racine :

```
NEXT_PUBLIC_SUPABASE_URL=ta_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ta_anon_key
SUPABASE_SERVICE_ROLE_KEY=ta_service_role_key
ANTHROPIC_API_KEY=ta_cle_anthropic
```

---

## Étape 4 — Lancer Claude Code (le gros du travail)

**Avant de lancer Claude Code**, place dans le dossier `life2/` :
- `budget-nolan-lylou.html` — télécharge-le depuis cette conversation Claude
- `recettes-app/` — copie ton dossier complet de l'app recettes existante ici

Claude Code va lire ces fichiers et récupérer toute la logique existante grâce aux instructions dans CLAUDE.md.

Lance Claude Code dans le dossier `life2` :

```bash
claude
```

Donne-lui cette instruction de démarrage :

> "Lis CLAUDE.md, SUPABASE.md et PROGRESS.md. On démarre par la Phase 1 complète. Crée toute la structure de fichiers, configure Supabase SSR avec middleware d'auth, et construis les pages login/register/onboarding avec le design system défini dans CLAUDE.md (pastel, blanc, Outfit font, radius 20px). Coche les items dans PROGRESS.md au fur et à mesure."

Ensuite pour chaque phase suivante :

> "Phase 2 terminée ? Passe à la Phase 3. Lis PROGRESS.md pour voir ce qui reste."

---

## Étape 5 — Déploiement Vercel (5 min)

1. Push ton projet sur GitHub
2. Va sur [vercel.com](https://vercel.com) → **New Project** → importe ton repo
3. Dans **Environment Variables**, ajoute les mêmes variables que dans `.env.local`
4. Deploy → t'as une URL publique
5. Les deux (toi et Lylou) accédez à cette URL

---

## Étape 6 — PWA sur mobile (2 min par personne)

**iPhone :** Safari → ton URL → icône partage → "Sur l'écran d'accueil"  
**Android :** Chrome → ton URL → menu ⋮ → "Ajouter à l'écran d'accueil"

L'app apparaît comme une vraie app, plein écran, sans barre de navigation du navigateur.

---

## Conseils

- **Travaille phase par phase.** Ne demande pas à Claude Code de tout faire en une fois.
- **Teste sur mobile** à chaque phase avec le lien Vercel (pas juste sur desktop).
- **Si Claude Code coince**, donne-lui le message d'erreur exact + demande-lui de relire CLAUDE.md.
- Le fichier `PROGRESS.md` est ta to-do list — coche au fur et à mesure.
