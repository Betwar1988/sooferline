-- SQL for Supabase Editor to sync auth metadata with a public profiles table
-- Run this in the SQL Editor of your Supabase project (https://supabase.com/dashboard/project/xhqhjkxbcmopjvaoblmx/sql)

-- 1. Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  perfil_profesional text,
  modulo_seleccionado text,
  plan text default 'Básico',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Create policies so users can only see and edit their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 4. Create a function to handle new user signups and sync metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, perfil_profesional, modulo_seleccionado, plan)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'perfil_profesional',
    new.raw_user_meta_data->>'modulo_seleccionado',
    new.raw_user_meta_data->>'plan'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    perfil_profesional = excluded.perfil_profesional,
    modulo_seleccionado = excluded.modulo_seleccionado,
    plan = excluded.plan,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- 5. Create a trigger that runs every time a user is updated or created in auth.users
-- This ensures that when you call supabase.auth.updateUser in Next.js, 
-- the data is also saved in the public.profiles table.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- Tip: To see your existing users in the profiles table, you can run:
-- insert into public.profiles (id, full_name, perfil_profesional, modulo_seleccionado, plan)
-- select id, raw_user_meta_data->>'full_name', raw_user_meta_data->>'perfil_profesional', raw_user_meta_data->>'modulo_seleccionado', raw_user_meta_data->>'plan'
-- from auth.users
-- on conflict do nothing;
