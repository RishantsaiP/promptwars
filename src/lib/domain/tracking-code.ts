/**
 * Generates a tracking code in the format CR-YYYY-NNNN.
 * @param existingCount The current total number of issues in the system.
 * @returns The next tracking code (e.g. CR-2026-0001).
 */
export function generateTrackingCode(existingCount: number): string {
  const year = new Date().getFullYear();
  const sequence = (existingCount + 1).toString().padStart(4, '0');
  return `CR-${year}-${sequence}`;
}
