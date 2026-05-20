<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Supabase RLS — règle obligatoire

**Ne jamais écrire de policy RLS sans caster TOUTES les colonnes en `text`.**

Dans la base de données réelle, `profiles.id`, `profiles.couple_id`, et `auth.uid()` ont des types qui ne correspondent pas exactement (text vs uuid). PostgreSQL rejette les comparaisons sans cast explicite avec l'erreur `operator does not exist: uuid = text`.

## Pattern à utiliser systématiquement

```sql
-- ✅ CORRECT — tout casté en text
create policy "nom" on ma_table
  for select using (
    couple_id::text = (
      select couple_id::text from profiles
      where id::text = auth.uid()::text
    )
  );
```

Ce pattern fonctionne pour `select`, `insert` (with check), `update`, et `delete`.

## Ce qui ne marche PAS

```sql
-- ❌ ERREUR: operator does not exist: uuid = text
couple_id = (select couple_id from profiles where id = auth.uid()::text)

-- ❌ ERREUR: même problème sans cast complet
couple_id = get_couple_id()  -- seulement si get_couple_id() a des types mal définis
```

## Template complet pour une nouvelle table

```sql
create table ma_table (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references couples(id) on delete cascade,
  -- ... autres colonnes
  created_at timestamptz not null default now()
);

alter table ma_table enable row level security;

create policy couple_select on ma_table
  for select using (
    couple_id::text = (select couple_id::text from profiles where id::text = auth.uid()::text)
  );

create policy couple_insert on ma_table
  for insert with check (
    couple_id::text = (select couple_id::text from profiles where id::text = auth.uid()::text)
  );

create policy couple_update on ma_table
  for update using (
    couple_id::text = (select couple_id::text from profiles where id::text = auth.uid()::text)
  );

create policy couple_delete on ma_table
  for delete using (
    couple_id::text = (select couple_id::text from profiles where id::text = auth.uid()::text)
  );
```
