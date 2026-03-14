
export const CURVE_PRESETS: Record<string, { label: string; intervals: number[]; hint: string }> = {
  cram14: { label: "Cram Mode (14 days)", intervals: [0, 1, 2, 3, 5, 7, 10, 14], hint: "For short-term sprints and cramming" },
  standard30: { label: "Standard Curve (30 days)", intervals: [0, 1, 3, 7, 14, 29], hint: "GRE-style 30-day consolidation curve" },
  long90: { label: "Long-term Mode (90 days)", intervals: [0, 1, 3, 7, 14, 29, 60, 90], hint: "Recommended for >150 problems" },
  custom: { label: "Custom", intervals: [], hint: "Manually set your review intervals" }
};

export interface PlaceholderMeta {
  title: string;
  link: string;
}

export interface PlanItem {
  id: string;
  date: string;
  type: "study" | "review";
  placeholders: string[]; // e.g. ["LC1", "LC2"]
  sourceId: string | null;
}

export interface PlannerState {
  startDate: string;
  totalCount: number;
  perDay: number;
  prefix: string;
  curveMode: string;
  intervals: number[];
  placeholders: Record<string, PlaceholderMeta>;
  items: PlanItem[];
}

export const defaultState = (): PlannerState => {
  const t = new Date();
  const yyyy = t.getFullYear(), mm = String(t.getMonth() + 1).padStart(2, "0"), dd = String(t.getDate()).padStart(2, "0");
  return {
    startDate: `${yyyy}-${mm}-${dd}`,
    totalCount: 150,
    perDay: 3,
    prefix: "LC",
    curveMode: "long90",
    intervals: CURVE_PRESETS.long90.intervals.slice(),
    placeholders: {},
    items: []
  };
};

export function ymd(d: Date): string {
  const yyyy = d.getFullYear(), mm = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return ymd(d);
}

export function generatePlan(state: PlannerState): PlannerState {
  const newState = { ...state };
  const items: PlanItem[] = [];
  const placeholders = { ...newState.placeholders };
  const totalDays = Math.ceil(newState.totalCount / newState.perDay);
  let counter = 1;
  const studyIds: { studyId: string; date: string; phs: string[] }[] = [];

  // Generate Study Days
  for (let i = 0; i < totalDays; i++) {
    const date = addDays(newState.startDate, i);
    const phs: string[] = [];
    for (let j = 0; j < newState.perDay && counter <= newState.totalCount; j++) {
      const ph = `${newState.prefix}${counter}`;
      phs.push(ph);
      if (!(ph in placeholders)) {
        placeholders[ph] = { title: "", link: "" };
      }
      counter++;
    }
    const studyId = `S${i + 1}`;
    studyIds.push({ studyId, date, phs });
    items.push({ id: studyId, date, type: "study", placeholders: phs, sourceId: null });
  }

  // Generate Review Days
  let reviewIndex = 1;
  for (const s of studyIds) {
    for (const interval of newState.intervals) {
      // interval 0 is technically the study day itself, but usually we review same day or next.
      // In the HTML logic, interval 0 adds a review item on the SAME day?
      // Checking HTML logic: yes, rDate = addDays(s.date, interval).
      // If interval is 0, it renders a review item on same day.
      const rDate = addDays(s.date, interval);
      items.push({
        id: `R${reviewIndex++}`,
        date: rDate,
        type: "review",
        placeholders: s.phs.slice(),
        sourceId: s.studyId
      });
    }
  }

  // Sort
  items.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.type !== b.type) return a.type === "study" ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  newState.items = items;
  newState.placeholders = placeholders;
  return newState;
}

export function parseIntervals(str: string): number[] {
  return str.split(",").map(s => parseInt(s.trim(), 10))
    .filter(n => Number.isFinite(n) && n >= 0).sort((a, b) => a - b);
}
