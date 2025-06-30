export function generateAccountNumber(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export function generateAccountName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.toUpperCase();
}