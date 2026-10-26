// The subset of a Strava activity the stats functions need.
export type Run = {
  id: number;
  name: string;
  sport_type: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number;
  total_elevation_gain: number; // meters
  start_date_local: string; // "2026-03-04T06:30:00Z" (local wall-clock time, labelled Z)
  start_latlng: [number, number] | [];
  map: { summary_polyline: string | null };
};
