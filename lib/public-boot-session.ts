export const PUBLIC_BOOT_SESSION_KEY = 'nk-public-boot'

export function hasCompletedPublicBoot(): boolean {
  try {
    return sessionStorage.getItem(PUBLIC_BOOT_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function markPublicBootComplete(): void {
  try {
    sessionStorage.setItem(PUBLIC_BOOT_SESSION_KEY, '1')
  } catch {
    // Private mode / quota — next visit may replay the boot.
  }
}
