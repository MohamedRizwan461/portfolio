/** What this visitor has already seen, for "Continue watching" progress bars. Local to their browser. */
const CHAPTERS_KEY = "riz-chapters-read";
const STATIONS_KEY = "riz-stations-seen";

function readSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(key) ?? "[]"));
  } catch {
    return new Set();
  }
}

function addTo(key: string, id: string) {
  try {
    const s = readSet(key);
    s.add(id);
    window.localStorage.setItem(key, JSON.stringify([...s]));
  } catch {}
}

export const markChapterRead = (id: string) => addTo(CHAPTERS_KEY, id);
export const markStationSeen = (id: string) => addTo(STATIONS_KEY, id);
export const chaptersRead = () => readSet(CHAPTERS_KEY);
export const stationsSeen = () => readSet(STATIONS_KEY);
