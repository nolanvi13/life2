# SUPABASE — Schéma de base de données

## Instructions pour Claude Code
Crée toutes ces tables dans Supabase via le SQL Editor. Exécute dans l'ordre (les foreign keys doivent référencer des tables existantes).

---

## SQL à exécuter

```sql
-- =====================
-- COUPLES & USERS
-- =====================

create table couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique default substring(gen_random_uuid()::text, 1, 8),
  name text,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  couple_id uuid references couples(id),
  display_name text,
  color text default '#7C5CFC', -- couleur perso dans l'app
  created_at timestamptz default now()
);

-- Trigger : crée profil automatiquement à l'inscription
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =====================
-- BUDGET
-- =====================

create table budget_entries (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id) on delete cascade not null,
  owner text not null check (owner in ('nolan', 'lylou', 'commun')),
  category text not null, -- 'revenu', 'obligatoire', 'voiture', 'abonnements', 'vie', 'epargne'
  label text not null,
  amount numeric(10,2) default 0,
  updated_at timestamptz default now()
);

-- =====================
-- RECETTES
-- =====================

create table recettes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id) on delete cascade not null,
  titre text not null,
  description text,
  portions int default 2,
  temps_prep int, -- minutes
  temps_cuisson int, -- minutes
  categorie text, -- 'petit-dej', 'dejeuner', 'diner', 'snack'
  tags text[], -- ['végétarien', 'rapide', 'batch-cooking']
  image_url text,
  source_url text, -- si importé depuis une URL
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table ingredients (
  id uuid primary key default gen_random_uuid(),
  recette_id uuid references recettes(id) on delete cascade not null,
  nom text not null,
  quantite numeric,
  unite text, -- 'g', 'ml', 'pièces', 'c.à.s', etc.
  ordre int default 0
);

create table etapes (
  id uuid primary key default gen_random_uuid(),
  recette_id uuid references recettes(id) on delete cascade not null,
  numero int not null,
  contenu text not null
);

-- =====================
-- LISTE DE COURSES
-- =====================

create table listes_courses (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id) on delete cascade not null,
  nom text default 'Courses de la semaine',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table items_courses (
  id uuid primary key default gen_random_uuid(),
  liste_id uuid references listes_courses(id) on delete cascade not null,
  nom text not null,
  quantite text,
  rayon text, -- 'fruits-legumes', 'viande', 'frais', 'epicerie', 'surgele', 'autre'
  checked boolean default false,
  added_by uuid references profiles(id),
  recette_id uuid references recettes(id), -- si ajouté depuis une recette
  created_at timestamptz default now()
);

-- =====================
-- CALENDRIER
-- =====================

create type event_category as enum (
  'rendez-vous',
  'sorties',
  'famille',
  'voyage',
  'anniversaire',
  'courses',
  'sport',
  'autre'
);

create table evenements (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references couples(id) on delete cascade not null,
  titre text not null,
  description text,
  date_debut timestamptz not null,
  date_fin timestamptz,
  toute_la_journee boolean default false,
  categorie event_category default 'autre',
  couleur text, -- hex color override
  recurrence text, -- 'none', 'weekly', 'monthly', 'yearly'
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

alter table couples enable row level security;
alter table profiles enable row level security;
alter table budget_entries enable row level security;
alter table recettes enable row level security;
alter table ingredients enable row level security;
alter table etapes enable row level security;
alter table listes_courses enable row level security;
alter table items_courses enable row level security;
alter table evenements enable row level security;

-- Helper function : récupère le couple_id du user connecté
create or replace function get_couple_id()
returns uuid as $$
  select couple_id from profiles where id = auth.uid()
$$ language sql security definer;

-- Policies génériques : accès si même couple_id
create policy "Couple members only" on budget_entries
  for all using (couple_id = get_couple_id());

create policy "Couple members only" on recettes
  for all using (couple_id = get_couple_id());

create policy "Couple members only" on listes_courses
  for all using (couple_id = get_couple_id());

create policy "Couple members only" on evenements
  for all using (couple_id = get_couple_id());

-- Ingredients et étapes : accès via recette parente
create policy "Via recette" on ingredients
  for all using (
    recette_id in (select id from recettes where couple_id = get_couple_id())
  );

create policy "Via recette" on etapes
  for all using (
    recette_id in (select id from recettes where couple_id = get_couple_id())
  );

-- Items courses : accès via liste parente
create policy "Via liste" on items_courses
  for all using (
    liste_id in (select id from listes_courses where couple_id = get_couple_id())
  );

-- Profils : chacun voit les profils de son couple
create policy "Same couple" on profiles
  for all using (
    couple_id = get_couple_id() or id = auth.uid()
  );
```

---

## Realtime à activer dans Supabase Dashboard
Dans **Database → Replication**, activer Realtime pour :
- `budget_entries`
- `items_courses`
- `evenements`

Ça permet à Lylou de voir les changements de Nolan en temps réel sans refresh.
