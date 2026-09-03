import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get("iam_admin")?.value === "1";
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ error: "No Supabase client" }, { status: 500 });

  const tables: string[] = [];
  const errors: string[] = [];

  for (const name of ["episodes", "paypal_claims", "subscriptions", "comments", "profiles"]) {
    try {
      const { error } = await supabase.from(name).select("*").limit(1);
      if (error) {
        errors.push(`${name}: ${error.message}`);
      } else {
        tables.push(name);
      }
    } catch (e: any) {
      errors.push(`${name}: ${e?.message || "exception"}`);
    }
  }

  return NextResponse.json({ ok: tables.length > 0, tables, errors });
}
