const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789_+-=';

export const generateAdminPassword = (length = 14): string => {
  const safeLength = Math.max(length, 12);
  const values = new Uint32Array(safeLength);
  crypto.getRandomValues(values);

  return Array.from(values, value => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]).join('');
};
