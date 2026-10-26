import type { computeRecap } from "@/lib/stats";
import type { BestEffort } from "@/lib/efforts";

export type RecapData = ReturnType<typeof computeRecap> & {
  athlete: { firstname: string; profile: string };
  /** undefined = still loading, null = failed */
  efforts?: BestEffort[] | null;
};
