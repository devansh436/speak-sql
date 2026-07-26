// Shared, app-wide constants. Keeping these in one place avoids the same
// magic string (like a localStorage key) drifting out of sync between the
// files that read it and the files that invalidate it.
export const TABLES_CACHE_KEY = "library_tables_cache";
export const TABLES_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes