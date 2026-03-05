-- SQL para actualizar el esquema de la base de datos
-- Agrega soporte para: múltiples archivos, previews, productos relacionados, ratings y reseñas

-- 1. Tabla de archivos múltiples por producto
create table if not exists public.product_files (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products(id) on delete cascade,
    name text not null,
    file_type text not null, -- 'main', 'preview', 'tutorial', 'manual', 'template', 'other'
    file_url text not null,
    file_size bigint, -- tamaño en bytes
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabla de productos relacionados
create table if not exists public.product_relations (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products(id) on delete cascade,
    related_product_id uuid references public.products(id) on delete cascade,
    relation_type text default 'related', -- 'related', 'complement', 'upgrade'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(product_id, related_product_id)
);

-- 3. Tabla de ratings y reseñas
create table if not exists public.product_reviews (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products(id) on delete cascade,
    user_id uuid references auth.users(id),
    rating integer not null check (rating >= 1 and rating <= 5),
    review_text text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Agregar campo average_rating y review_count a products (para facilitar consultas)
alter table public.products add column if not exists average_rating numeric(2,1) default 0;
alter table public.products add column if not exists review_count integer default 0;

-- 5. Agregar campos de fecha de actualización a products
alter table public.products add column if not exists last_updated timestamp with time zone;
alter table public.products add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- 6. Agregar campo para mostrar precio con descuento (optional)
alter table public.products add column if not exists original_price numeric;
alter table public.products add column if not exists discount_percentage integer;

-- 7. Agregar campo para destacado/destacado en homepage
alter table public.products add column if not exists featured boolean default false;

-- 8. Agregar campo para ordenar productos
alter table public.products add column if not exists sort_order integer default 0;

-- Habilitar RLS en nuevas tablas
alter table public.product_files enable row level security;
alter table public.product_relations enable row level security;
alter table public.product_reviews enable row level security;

-- Políticas RLS para product_files
create policy "Archivos visibles públicamente" on public.product_files for select using (true);
create policy "Admin puede gestionar archivos" on public.product_files for all using (
    exists (select 1 from public.profiles where id = auth.uid() and perfil_profesional = 'admin')
);

-- Políticas RLS para product_relations
create policy "Relaciones visibles públicamente" on public.product_relations for select using (true);

-- Políticas RLS para product_reviews
create policy "Reseñas visibles públicamente" on public.product_reviews for select using (true);
create policy "Usuarios pueden crear reseñas" on public.product_reviews for insert with check (auth.uid() = user_id);
create policy "Usuarios pueden actualizar sus reseñas" on public.product_reviews for update using (auth.uid() = user_id);

-- Función para actualizar rating promedio del producto
create or replace function public.update_product_rating()
returns trigger as $$
begin
    update public.products
    set 
        average_rating = (select avg(rating) from public.product_reviews where product_id = coalesce(new.product_id, old.product_id)),
        review_count = (select count(*) from public.product_reviews where product_id = coalesce(new.product_id, old.product_id))
    where id = coalesce(new.product_id, old.product_id);
    return new;
end;
$$ language plpgsql security definer;

-- Trigger para actualizar rating cuando se modifica/insertareseña
drop trigger if exists trigger_update_rating on public.product_reviews;
create trigger trigger_update_rating
after insert or update or delete on public.product_reviews
for each row execute procedure update_product_rating();
