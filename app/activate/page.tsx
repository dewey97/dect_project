import { CaseActivation } from "@/components/investigation/case-activation";
import { getPublicCases } from "@/lib/actions/case-actions";

export const dynamic = "force-dynamic";

export default async function ActivatePage() {
  const result = await getPublicCases();
  const cases = result.success ? result.data : [];

  return <CaseActivation initialCases={cases} />;
}
