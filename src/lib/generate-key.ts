export function generateSecretKey(username: string): string {
  const randomPart = crypto.randomUUID().slice(0, 8);
  return `${username}.${randomPart}`;
}
