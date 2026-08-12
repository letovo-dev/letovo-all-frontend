const SAFE_PROTOCOLS = /^(https?|mailto|tel):/i;
const ABSOLUTE_URL = /^[a-z][a-z0-9+.-]*:/i;

/** Относительные адреса разрешены, абсолютные — только по безопасным протоколам. */
export const isSafeUrl = (url: string): boolean => {
  const value = url.trim();
  if (!value) return false;
  return ABSOLUTE_URL.test(value) ? SAFE_PROTOCOLS.test(value) : true;
};

/**
 * Спрашивает адрес и отбрасывает небезопасные схемы (`javascript:` и подобные)
 * до того, как значение попадёт в разметку статьи.
 */
export const promptSafeUrl = (message: string): string | null => {
  const url = window.prompt(message, 'https://');
  if (!url) return null;
  if (!isSafeUrl(url)) {
    window.alert(
      'Такой адрес вставить нельзя: разрешены http(s), mailto, tel и относительные пути.',
    );
    return null;
  }
  return url.trim();
};
