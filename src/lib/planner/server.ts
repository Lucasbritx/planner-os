import { createSupabasePlannerRepository } from "@/lib/planner/supabase-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loadPlannerSnapshot() {
  const supabase = await createSupabaseServerClient();
  const repository = createSupabasePlannerRepository(supabase);

  await repository.ensureCurrentWeek();

  return repository.load();
}
