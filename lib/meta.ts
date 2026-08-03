import { createClient } from "@supabase/supabase-js";
import type { ExtensionMeta } from "@/models/meta";

interface MetaRow {
  id: string;
  extensions: string[];
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

function isMissingTableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "PGRST205"
  );
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const isJwtLike =
    typeof serviceKey === "string" &&
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(serviceKey);

  const key = isJwtLike ? serviceKey : publishableKey;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapMetaRow(row: MetaRow): ExtensionMeta {
  return {
    id: row.id,
    extensions: row.extensions,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
  };
}

export async function getAllMeta(): Promise<ExtensionMeta[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("meta")
    .select("id,extensions,start_date,end_date,created_at")
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) {
      return [];
    }
    throw error;
  }

  return (
    (data.sort(
      (a, b) =>
        Number(a.extensions[0].slice(2)) - Number(b.extensions[0].slice(2)),
    ) ?? []) as MetaRow[]
  ).map(mapMetaRow);
}

export async function getMetaById(
  id: string,
): Promise<ExtensionMeta | undefined> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("meta")
    .select("id,extensions,start_date,end_date,created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      return undefined;
    }
    throw error;
  }

  return data ? mapMetaRow(data as MetaRow) : undefined;
}

export async function createMeta(
  extensions: string[],
  startDate: string | null,
  endDate: string | null,
): Promise<ExtensionMeta> {
  const supabase = getSupabaseClient();

  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from("meta")
    .insert({
      id,
      extensions,
      start_date: startDate,
      end_date: endDate,
    })
    .select("id,extensions,start_date,end_date,created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapMetaRow(data as MetaRow);
}

export async function updateMeta(
  id: string,
  extensions: string[],
  startDate: string | null,
  endDate: string | null,
): Promise<ExtensionMeta | undefined> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("meta")
    .update({
      extensions,
      start_date: startDate,
      end_date: endDate,
    })
    .eq("id", id)
    .select("id,extensions,start_date,end_date,created_at")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapMetaRow(data as MetaRow) : undefined;
}

export async function deleteMeta(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("meta")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw error;
  }

  return Boolean(data && data.length > 0);
}
