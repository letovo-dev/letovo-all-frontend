export interface AuthorOption {
  id: string;
  name: string;
  displayName?: string | null;
}

export interface AuthorSelectOption {
  value: string;
  label: string;
  searchText: string;
}

export const normalizeAuthorSearch = (value: string): string =>
  value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

export const formatAuthorLabel = (author: AuthorOption): string => {
  const displayName = author.displayName?.trim();
  return displayName ? `${displayName} (@${author.name})` : author.name;
};

export const buildAuthorSelectOptions = (authors: AuthorOption[]): AuthorSelectOption[] =>
  authors.map(author => ({
    value: author.id,
    label: formatAuthorLabel(author),
    searchText: normalizeAuthorSearch(`${author.name} ${author.displayName ?? ''}`),
  }));

export const filterAuthorOption = (input: string, option?: { searchText?: string }): boolean => {
  const query = normalizeAuthorSearch(input);
  return query === '' || normalizeAuthorSearch(option?.searchText ?? '').includes(query);
};
