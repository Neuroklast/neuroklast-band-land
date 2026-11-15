/**
 * An unsuccessful admin read must never look like a successful empty dataset.
 * Avoid rendering editable defaults after an unavailable Supabase response.
 */
export type AdminReadResult<T> =
  | { ok: true; data: T }
  | { ok: false }

export async function loadAdminData<T>(
  operation: string,
  read: () => Promise<T>,
): Promise<AdminReadResult<T>> {
  try {
    return { ok: true, data: await read() }
  } catch (error) {
    console.error('[admin-data] ' + operation + ' failed:', error)
    return { ok: false }
  }
}

export function checkAdminReadError(error: { message: string } | null, operation: string): void {
  if (error) throw new Error(operation + ': ' + error.message)
}
