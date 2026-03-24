export function userCollection(userId: string, name: string): string {
  return `users/${userId}/${name}`
}

export function userDoc(userId: string, collection: string, docId: string): string {
  return `users/${userId}/${collection}/${docId}`
}
