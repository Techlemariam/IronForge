export function getErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  try {
    const serialized = JSON.stringify(error);
    return serialized || fallback;
  } catch {
    return fallback;
  }
}
