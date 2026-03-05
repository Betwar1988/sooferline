-- SQL para configurar RAG (Retrieval Augmented Generation) en Supabase
-- Ejecuta esto en el SQL Editor de tu Dashboard de Supabase.

-- 1. Habilitar la extensión pgvector para manejar vectores de embeddings
create extension if not exists vector;

-- 2. Crear tabla de documentos (Metadatos de los archivos originales)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  storage_path text not null, -- Ruta en Supabase Storage (RAW STORAGE)
  module text not null, -- 'contabilidad', 'tributaria', 'laboral'
  file_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  uploaded_by uuid references auth.users(id)
);

-- 3. Crear tabla de fragmentos (Chunks) con sus embeddings
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  content text not null, -- El texto del fragmento
  metadata jsonb, -- Información extra (página, capítulo, etc.)
  embedding vector(1536) -- Vector para modelos de OpenAI (text-embedding-3-small) o similar
);

-- 4. Crear un índice de búsqueda vectorial (HNSW para velocidad)
create index on public.document_chunks using hnsw (embedding vector_cosine_ops);

-- 5. Crear tabla de logs de consultas (Para limitar según el plan)
create table if not exists public.query_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  query text not null,
  response text,
  plan_at_time text,
  module_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Función de búsqueda semántica (RPC)
-- Esta función será llamada desde Next.js o Edge Functions para encontrar fragmentos relevantes.
create or replace function match_document_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_module text default null
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  join documents on document_chunks.document_id = documents.id
  where (filter_module is null or documents.module = filter_module)
    and 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 7. Configurar RLS (Row Level Security)
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.query_logs enable row level security;

-- Políticas básicas (Lectura pública o para usuarios autenticados según necesites)
create policy "Documentos visibles para usuarios autenticados" 
  on public.documents for select using (auth.role() = 'authenticated');

create policy "Chunks visibles para usuarios autenticados" 
  on public.document_chunks for select using (auth.role() = 'authenticated');

create policy "Logs visibles solo por el dueño" 
  on public.query_logs for all using (auth.uid() = user_id);
