export const dynamic = "force-dynamic";

import { PlannerApp } from "@/components/planner-app";
import { loadPlannerSnapshot } from "@/lib/planner/server";

export default async function Page(){
  const initialData = await loadPlannerSnapshot();
  return <PlannerApp page="books" initialData={initialData}/>;
}
