export const storage = {
  get(key) {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage unavailable — silently ignore
    }
  },

  remove(key) {
    try {
      sessionStorage.removeItem(key)
    } catch {
      // Silently ignore
    }
  },

  clear() {
    try {
      sessionStorage.clear()
    } catch {
      // Silently ignore
    }
  },
}