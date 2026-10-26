import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Recap } from "@/components/Recap";

async function Guard() {
  if (!(await getSession())) redirect("/");
  return <Recap />;
}

export default function RecapPage() {
  return (
    <Suspense>
      <Guard />
    </Suspense>
  );
}
