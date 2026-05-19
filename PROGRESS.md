# PROGRESS — Life2

## Statut global
`[x]` Phase 1 — Setup & Auth  
`[x]` Phase 2 — Budget  
`[x]` Phase 3 — Recettes & Courses  
`[x]` Phase 4 — Calendrier  
`[ ]` Phase 5 — PWA & polish  

---

## Phase 1 — Setup & Auth
`[x]` Init projet Next.js 16 avec TypeScript + Tailwind + Shadcn  
`[x]` Installer et configurer Supabase (`@supabase/ssr`)  
`[x]` Proxy d'auth (protection des routes) — `proxy.ts`  
`[x]` Page `/login` — email + password  
`[x]` Page `/register` — email + password + display_name  
`[x]` Logique "créer un couple" à l'inscription  
`[x]` Logique "rejoindre un couple" avec invite_code  
`[x]` Page onboarding — affiche le code d'invitation  
`[x]` Hook `useCouple` — expose `couple_id`, `partner`  
`[x]` Bottom nav mobile (Budget / Recettes / Courses / Calendrier)  
`[x]` Sidebar desktop  

## Phase 2 — Budget
`[x]` Hook `useBudget` — CRUD sur `budget_entries`  
`[x]` Page `/budget` avec tabs Nolan / Lylou / Commun / Synthèse  
`[x]` Migrer la logique du fichier HTML existant vers React  
`[x]` Gauge "reste à vivre" avec couleur dynamique  
`[x]` Realtime : mise à jour en temps réel quand le partenaire modifie  
`[x]` Persistance Supabase (remplace localStorage)  

## Phase 3 — Recettes & Courses
`[x]` Hook `useRecettes` — CRUD sur `recettes` + realtime Supabase  
`[x]` Page `/recettes` — grille de cards avec filtres par catégorie  
`[x]` Page détail recette (modal bottom sheet)  
`[x]` Import recette par IA (URL → Claude API → structured JSON)  
`[x]` Hook `useCourses` — CRUD sur `items_courses` + realtime  
`[x]` Page `/courses` — liste groupée par rayon  
`[x]` "Ajouter à la liste" depuis une recette  
`[x]` Check/uncheck item en temps réel  

## Phase 4 — Calendrier
`[ ]` Hook `useCalendrier` — CRUD sur `evenements`  
`[ ]` Page `/calendrier` — vue mensuelle  
`[ ]` Créer / éditer un événement (modal)  
`[ ]` Filtres par catégorie avec couleurs pastels  
`[ ]` Vue liste des prochains événements  
`[ ]` Rappels via Web Push Notifications (optionnel)  

## Phase 5 — PWA & polish
`[ ]` Configuration `next-pwa`  
`[ ]` Manifest JSON (icône, thème, standalone)  
`[ ]` Icons toutes tailles générées  
`[ ]` Page d'erreur offline  
`[ ]` Animations d'entrée sur les cards (stagger)  
`[ ]` Tests sur iPhone et Android  
`[ ]` Déploiement Vercel + domaine custom  
