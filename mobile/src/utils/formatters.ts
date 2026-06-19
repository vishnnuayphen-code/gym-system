/**
 * Converts "MALE" → "Male", "FEMALE" → "Female"
 */
export function formatEnum(value: string | null | undefined): string {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/**
 * Converts "WEIGHT_LOSS" → "Weight Loss", "GENERAL_FITNESS" → "General Fitness"
 */
export function formatEnumWithSpaces(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
