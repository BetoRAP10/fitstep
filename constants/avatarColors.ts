// Set curado de 8 tonos para avatares con iniciales (usuarios sin foto).
export const avatarPalette = [
  '#C6F432',
  '#FF6B4A',
  '#5FA8D6',
  '#E4B94B',
  '#8A79E8',
  '#5FD68B',
  '#E86FA0',
  '#4FBFC0',
] as const;

// Asigna un color estable a partir de un identificador (nombre o id de usuario).
export function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % avatarPalette.length;
  return avatarPalette[index];
}
