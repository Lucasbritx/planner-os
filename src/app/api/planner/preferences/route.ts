import { NextResponse, type NextRequest } from "next/server";

import { createSupabasePlannerRepository } from "@/lib/planner/supabase-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Preferences } from "@/lib/types";

export async function PATCH(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<Preferences>;
    const supabase = await createSupabaseServerClient();
    const repository = createSupabasePlannerRepository(supabase);
    const preferences = await repository.updatePreferences(payload);

    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível salvar preferências." },
      { status: 400 },
    );
  }
}
