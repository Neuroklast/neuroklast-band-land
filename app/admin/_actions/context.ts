import { validateAdminAction, type AdminActionResult } from '@/lib/admin-action-registry'

/**
 * Pure schema/disclosure check for authenticated Next.js server actions.
 * Authorization and the actual database mutation remain the responsibility
 * of the server action. Never report validation as successful execution.
 */
export function validateAdminActionAsAdmin(
  actionId: string,
  rawInput: unknown,
): AdminActionResult {
  return validateAdminAction(actionId, rawInput, 'expert')
}
