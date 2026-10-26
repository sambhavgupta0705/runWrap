import type { RunnerType } from "./stats";

// Picked from the most common start-time bucket; plain copy, nothing generated.
export const PERSONAS: Record<RunnerType, { title: string; window: string; lines: string[] }> = {
  "Early Bird": {
    title: "Dawn Patrol",
    window: "before 7am",
    lines: ["You meet the day before it wakes up.", "Quiet streets, first light, and the miles already done."],
  },
  "Morning Runner": {
    title: "Sunrise Ritualist",
    window: "7–11am",
    lines: ["You run before the day makes its demands.", "A steady start, one kilometre at a time."],
  },
  "Lunch Runner": {
    title: "Midday Wanderer",
    window: "11am–3pm",
    lines: ["You carve out the middle of the day for yourself.", "Sun overhead, inbox unopened."],
  },
  "Evening Runner": {
    title: "Golden Hour Chaser",
    window: "3–9pm",
    lines: ["You close the day the way it deserves.", "Soft light, an easy rhythm, a clear head."],
  },
  "Night Owl": {
    title: "Moonlight Mover",
    window: "after 9pm",
    lines: ["You run when the city goes quiet.", "Streetlights, empty roads, nothing but rhythm."],
  },
};
