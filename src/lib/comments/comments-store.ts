export interface Comment {
  id: string
  authorName: string
  body: string
  createdAt: string
}

/**
 * Keyed by `${module}:${entityId}` in a single mock in-memory map —
 * real usage would fetch/post to `/comments?module=leads&entityId=...`.
 * Kept here rather than per-module so every detail page shares one
 * implementation.
 */
const store = new Map<string, Comment[]>()

function key(module: string, entityId: string) {
  return `${module}:${entityId}`
}

export function seedComments(module: string, entityId: string, comments: Comment[]) {
  if (!store.has(key(module, entityId))) {
    store.set(key(module, entityId), comments)
  }
}

export function getComments(module: string, entityId: string): Comment[] {
  return store.get(key(module, entityId)) ?? []
}

export function addComment(module: string, entityId: string, comment: Comment) {
  const list = store.get(key(module, entityId)) ?? []
  store.set(key(module, entityId), [...list, comment])
}
