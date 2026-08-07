import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

// OAuth providers (Google, etc.) redirect the browser back here with a
// `code` query param after the user approves consent. Supabase's own
// hosted callback (https://<project>.supabase.co/auth/v1/callback) already
// exchanged that with the provider — this route exchanges *that* code for
// a Supabase session and sets the session cookies on our domain.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
