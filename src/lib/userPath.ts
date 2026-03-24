/**
 * User-scoped Firestore path prefix.
 * All collections are nested under this user document.
 */
const USER_ID = "5f1jhWVLSZc4Bl9Ym6A81d3dF8G2"

export const USER_PREFIX = `users/${USER_ID}`

export function userCollection(name: string): string {
  return `${USER_PREFIX}/${name}`
}

export function userDoc(collection: string, docId: string): string {
  return `${USER_PREFIX}/${collection}/${docId}`
}
