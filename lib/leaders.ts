import { createClient } from "@supabase/supabase-js";
import type { Leader } from "@/models/leader";

interface LeaderRow {
  id: string;
  name: string;
  colors: string[];
  image_url: string;
  alt_image_url: string | null;
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

function mapLeaderRow(row: LeaderRow): Leader {
  return {
    id: row.id,
    name: row.name,
    colors: row.colors,
    imageUrl: row.image_url,
    altImageUrl: row.alt_image_url ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getLeaders(): Promise<Leader[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("leaders")
    .select("id,name,colors,image_url,alt_image_url,created_at")
    .order("id", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) {
      return [];
    }
    throw error;
  }

  return ((data ?? []) as LeaderRow[]).map(mapLeaderRow);
}

export async function getLeaderById(id: string): Promise<Leader | undefined> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("leaders")
    .select("id,name,colors,image_url,alt_image_url,created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      return undefined;
    }
    throw error;
  }

  return data ? mapLeaderRow(data as LeaderRow) : undefined;
}

export async function createLeader(
  name: string,
  colors: string[],
  imageUrl: string,
  altImageUrl?: string,
): Promise<Leader> {
  const supabase = getSupabaseClient();

  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from("leaders")
    .insert({
      id,
      name,
      colors,
      image_url: imageUrl,
      alt_image_url: altImageUrl ?? null,
    })
    .select("id,name,colors,image_url,alt_image_url,created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapLeaderRow(data as LeaderRow);
}

export async function updateLeader(
  id: string,
  name: string,
  colors: string[],
  imageUrl: string,
  altImageUrl?: string,
): Promise<Leader | undefined> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("leaders")
    .update({
      name,
      colors,
      image_url: imageUrl,
      alt_image_url: altImageUrl ?? null,
    })
    .eq("id", id)
    .select("id,name,colors,image_url,alt_image_url,created_at")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapLeaderRow(data as LeaderRow) : undefined;
}

export async function deleteLeader(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("leaders")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    throw error;
  }

  return Boolean(data && data.length > 0);
}
