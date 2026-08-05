// Quita mayúsculas y acentos para comparar texto de forma natural
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}
