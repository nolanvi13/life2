-- Migration: Table Dépenses (style Tricount)
-- À exécuter dans Supabase > SQL Editor

create table if not exists depenses (
  id          uuid         default gen_random_uuid() primary key,
  couple_id   uuid         not null,
  description text         not null,
  amount      numeric(10,2) not null check (amount > 0),
  paid_by     text         not null, -- 'nolan' | 'lylou' (premier / deuxième membre)
  split       boolean      not null default true,
  category    text         not null default 'Autre',
  created_at  timestamptz  not null default now()
);

-- RLS
alter table depenses enable row level security;

create policy if not exists couple_select on depenses
  for select using (
    couple_id = (select couple_id from profiles where id = auth.uid())
  );

create policy if not exists couple_insert on depenses
  for insert with check (
    couple_id = (select couple_id from profiles where id = auth.uid())
  );

create policy if not exists couple_delete on depenses
  for delete using (
    couple_id = (select couple_id from profiles where id = auth.uid())
  );

-- Realtime
alter publication supabase_realtime add table depenses;
