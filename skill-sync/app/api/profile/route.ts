import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const payload = await request.json();
  const fullName = String(payload.fullName ?? "").trim();
  const roleInput = String(payload.role ?? "").trim();
  

  const role = normalizeRole(roleInput);

  if (!fullName || !role) {
    return NextResponse.json({ error: "Full name and a valid role are required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        email: user.email ?? "",
        role,
      },
      { onConflict: "id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
