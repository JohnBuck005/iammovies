import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  const cookie = request.cookies.get("iam_admin");
  return cookie?.value === "1";
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getServerSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, created_at, last_sign_in_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Failed to load users:", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [] });
}
