import { NextResponse, type NextRequest } from "next/server";

import { collectionTableMap, type PlannerCollection } from "@/lib/planner/mappers";
import { createSupabasePlannerRepository } from "@/lib/planner/supabase-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isPlannerCollection(value: string): value is PlannerCollection {
  return value in collectionTableMap;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ collection: string }> },
) {
  const { collection } = await context.params;

  if (!isPlannerCollection(collection)) {
    return NextResponse.json({ error: "Coleção inválida." }, { status: 404 });
  }

  try {
    const payload = (await request.json()) as never;
    const supabase = await createSupabaseServerClient();
    const repository = createSupabasePlannerRepository(supabase);
    const item = await repository.create(collection, payload);

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível salvar." },
      { status: 400 },
    );
  }
}
