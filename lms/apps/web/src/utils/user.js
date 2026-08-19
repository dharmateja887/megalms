export function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('qt_nxt_user') || '{}')
  } catch {
    return {}
  }
}

export function getDisplayName(user = {}) {
  const firstName = String(user.firstName || '').trim()
  const lastName = String(user.lastName || '').trim()
  const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim()

  if (combinedName) return combinedName
  if (user.name) return String(user.name).trim()
  if (user.email) return String(user.email).trim()
  if (user.phone) return String(user.phone).trim()

  return 'Creator'
}

export function getUserInitials(user = {}) {
  const firstName = String(user.firstName || '').trim()
  const lastName = String(user.lastName || '').trim()

  if (firstName || lastName) {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U'
  }

  const fallback = getDisplayName(user)
  return fallback
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
