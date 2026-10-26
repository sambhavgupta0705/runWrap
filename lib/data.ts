import { clearMatching } from "./cache";

/**
 * Deletes everything we hold for an athlete. Today that is only the short-lived
 * in-memory cache of their runs (the session cookie lives in their own browser).
 * When Postgres lands, also delete the user row, tokens and cached stats here:
 * the deauth webhook calls this.
 */
export async function deleteAthleteData(athleteId: number): Promise<void> {
  clearMatching(`:${athleteId}:`);
}
